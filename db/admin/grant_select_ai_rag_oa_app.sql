-- Grants and checks for SEAssist Select AI RAG setup.
-- Run this as ADMIN or another privileged ADB administrator, not as OAA_APP.
--
-- Usage in SQLcl / SQL Developer:
--   define app_user = OAA_APP
--   @db/admin/grant_select_ai_rag_oa_app.sql
--
-- OCI IAM prerequisites outside the database:
--   1. Put the Autonomous Database in a dynamic group.
--      Example rule for one ADB:
--        resource.id = '<autonomous-database-ocid>'
--   2. Grant that dynamic group access to Object Storage and OCI Generative AI.
--      Least-privilege starting point:
--        Allow dynamic-group <dg-name> to read buckets in compartment <bucket-compartment>
--        Allow dynamic-group <dg-name> to read objects in compartment <bucket-compartment>
--        Allow dynamic-group <dg-name> to use generative-ai-family in compartment <genai-compartment>
--      Scope these policies tighter with compartment and bucket conditions where your tenancy policy model allows it.

set define on
set serveroutput on

define app_user = OAA_APP

prompt Granting Select AI RAG privileges to &&app_user

grant create session to &&app_user;

-- Needed by the existing app schema/migrations and by Oracle-managed vector store tables.
grant create table to &&app_user;
grant create view to &&app_user;
grant create sequence to &&app_user;
grant create procedure to &&app_user;

-- Needed to create, set, generate from, enable, and manage Select AI profiles and vector indexes.
grant execute on DBMS_CLOUD_AI to &&app_user;

-- Required by Oracle Select AI for RAG/vector indexing. This does not grant CREATE JOB
-- and does not mean the app is creating its own ingestion pipeline.
grant execute on DBMS_CLOUD_PIPELINE to &&app_user;

-- Needed only if &&app_user will create or manage DBMS_CLOUD credentials.
-- With OCI$RESOURCE_PRINCIPAL, this is still useful for credential checks and future non-resource-principal paths.
grant execute on DBMS_CLOUD to &&app_user;

-- Required so the vector store table created by CREATE_VECTOR_INDEX has storage room.
-- Autonomous Database commonly uses DATA; adjust if DBA_TS_QUOTAS shows a different DATA% tablespace.
alter user &&app_user quota unlimited on DATA;

prompt Granting outbound network ACL for &&app_user

begin
  DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
    host => '*',
    ace => xs$ace_type(
      privilege_list => xs$name_list('connect'),
      principal_name => upper('&&app_user'),
      principal_type => xs_acl.ptype_db
    )
  );
exception
  when others then
    if sqlcode = -24243 then
      dbms_output.put_line('Outbound network ACL already exists for &&app_user.');
    else
      raise;
    end if;
end;
/

prompt Enabling resource principal for ADMIN and &&app_user

declare
  credential_count number;
begin
  select count(*)
    into credential_count
    from dba_credentials
   where owner = 'ADMIN'
     and credential_name = 'OCI$RESOURCE_PRINCIPAL';

  if credential_count = 0 then
    DBMS_CLOUD_ADMIN.ENABLE_RESOURCE_PRINCIPAL();
  else
    dbms_output.put_line('OCI$RESOURCE_PRINCIPAL already exists for ADMIN.');
  end if;
end;
/

declare
  grant_count number;
begin
  select count(*)
    into grant_count
    from dba_tab_privs
   where grantee = upper('&&app_user')
     and table_schema = 'ADMIN'
     and table_name = 'OCI$RESOURCE_PRINCIPAL';

  if grant_count = 0 then
    DBMS_CLOUD_ADMIN.ENABLE_RESOURCE_PRINCIPAL(username => upper('&&app_user'));
  else
    dbms_output.put_line('&&app_user already has access to OCI$RESOURCE_PRINCIPAL.');
  end if;
end;
/

-- Required if RAG/narrate responses need to send retrieved document snippets to the LLM.
exec DBMS_CLOUD_AI.ENABLE_DATA_ACCESS();

prompt Verifying package grants

select table_name as package_name, privilege
from dba_tab_privs
where grantee = upper('&&app_user')
  and table_name in ('DBMS_CLOUD', 'DBMS_CLOUD_AI', 'DBMS_CLOUD_PIPELINE')
order by table_name, privilege;

prompt Verifying resource principal grant

select grantee, table_schema, table_name, privilege
from dba_tab_privs
where grantee = upper('&&app_user')
  and table_schema = 'ADMIN'
  and table_name = 'OCI$RESOURCE_PRINCIPAL'
order by privilege;

prompt Verifying tablespace quota

select username, tablespace_name, bytes, max_bytes
from dba_ts_quotas
where username = upper('&&app_user')
  and tablespace_name like 'DATA%'
order by tablespace_name;

prompt Verifying outbound network ACL

select host, lower_port, upper_port, ace_order, principal, privilege
from dba_host_aces
where principal = upper('&&app_user')
  and host = '*'
order by ace_order, privilege;

prompt Done. Connect as &&app_user to create the Select AI profile and vector index.
