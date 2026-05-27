-- Create the SEAssist Select AI RAG vector index for Oracle-private knowledge.
-- Run this as OAA_APP after grant_select_ai_rag_oa_app.sql has been run by ADMIN.
--
-- This is intentionally scoped to the approved Object Storage wildcard for private RAG.
-- It does not create an app-managed ingestion pipeline.

set define on
set verify off
set serveroutput on
set linesize 220
set pagesize 100

define profile_name = SEAssist_RAG_PROFILE
define vector_index_name = OAA_ORACLE_PRIVATE_RAG_IDX
define vector_table_name = OAA_ORACLE_PRIVATE_RAG_TAB
define object_storage_credential_name = OCI$RESOURCE_PRINCIPAL
define object_storage_location = https://objectstorage.us-chicago-1.oraclecloud.com/n/orasenatdpublicsector06/b/SEAssistCollateral/o/*
define oci_compartment_id = ocid1.compartment.oc1..aaaaaaaa4vlrstdp4e3npzkawtvvqhpfzrdsusos6aiu5t2lq4i57rcokika
define oci_region = us-chicago-1
define chat_model = xai.grok-4.3
define embedding_model = cohere.embed-v4.0
define max_tokens = 6000
define temperature = 0.2
define vector_dimension = 1536
define chunk_size = 2048
define chunk_overlap = 256
define match_limit = 5
define refresh_rate_minutes = 1440
define wait_for_completion = true

prompt Creating or updating Select AI profile &&profile_name

declare
  profile_count number;
  profile_attributes clob := q'~{
    "provider": "oci",
    "credential_name": "&&object_storage_credential_name",
    "oci_compartment_id": "&&oci_compartment_id",
    "region": "&&oci_region",
    "model": "&&chat_model",
    "embedding_model": "&&embedding_model",
    "max_tokens": &&max_tokens,
    "temperature": &&temperature
  }~';
begin
  select count(*)
    into profile_count
    from user_cloud_ai_profiles
   where upper(profile_name) = upper('&&profile_name');

  if profile_count = 0 then
    DBMS_CLOUD_AI.CREATE_PROFILE(
      profile_name => '&&profile_name',
      attributes => profile_attributes
    );
    dbms_output.put_line('Created Select AI profile &&profile_name.');
  else
    DBMS_CLOUD_AI.SET_ATTRIBUTES(
      profile_name => '&&profile_name',
      attributes => profile_attributes
    );
    dbms_output.put_line('Updated Select AI profile &&profile_name.');
  end if;
end;
/

prompt Creating or enabling vector index &&vector_index_name

declare
  index_count number;
  index_attributes clob := q'~{
    "vector_db_provider": "oracle",
    "vector_table_name": "&&vector_table_name",
    "location": "&&object_storage_location",
    "object_storage_credential_name": "&&object_storage_credential_name",
    "profile_name": "&&profile_name",
    "vector_distance_metric": "cosine",
    "chunk_overlap": &&chunk_overlap,
    "chunk_size": &&chunk_size,
    "vector_dimension": &&vector_dimension,
    "match_limit": &&match_limit,
    "refresh_rate": &&refresh_rate_minutes,
    "enable_sources": true
  }~';
begin
  select count(*)
    into index_count
    from user_cloud_vector_indexes
   where upper(index_name) = upper('&&vector_index_name');

  if index_count = 0 then
    DBMS_CLOUD_AI.CREATE_VECTOR_INDEX(
      index_name => '&&vector_index_name',
      attributes => index_attributes,
      status => 'Enabled',
      description => 'SEAssist Oracle-private field knowledge RAG index',
      wait_for_completion => &&wait_for_completion
    );
    dbms_output.put_line('Created vector index &&vector_index_name.');
  else
    DBMS_CLOUD_AI.ENABLE_VECTOR_INDEX(index_name => '&&vector_index_name');
    dbms_output.put_line('Vector index &&vector_index_name already exists; ensured it is enabled.');
  end if;
end;
/

prompt Attaching private vector index to profile &&profile_name

begin
  DBMS_CLOUD_AI.SET_ATTRIBUTE(
    profile_name => '&&profile_name',
    attribute_name => 'vector_index_name',
    attribute_value => '&&vector_index_name'
  );
end;
/

prompt Registering private vector index in SEAssist control table if migration 002 has been applied

declare
  control_table_count number;
begin
  select count(*)
    into control_table_count
    from user_tables
   where table_name = 'OAA_RAG_VECTOR_INDEXES';

  if control_table_count = 0 then
    dbms_output.put_line('OAA_RAG_VECTOR_INDEXES not found; skipping app registry row.');
  else
    execute immediate q'~
      update oaa_rag_vector_indexes
         set status = 'disabled',
             updated_at = systimestamp
       where index_name in ('OAA_ORACLE_PUBLIC_RAG_IDX', 'OAA_LEGACY_RAG_IDX')
         and status = 'active'
    ~';

    execute immediate q'~
      merge into oaa_rag_vector_indexes target
      using (select '869af78fa045ae8660f47a40b2e46910' as id from dual) source
        on (target.id = source.id)
      when matched then update set
        target.index_name = '&&vector_index_name',
        target.display_name = 'Oracle private field knowledge',
        target.profile_name = '&&profile_name',
        target.vector_table_name = '&&vector_table_name',
        target.object_storage_location = '&&object_storage_location',
        target.object_storage_credential_name = '&&object_storage_credential_name',
        target.corpus = 'oracle',
        target.knowledge_layer = 'oracle-private',
        target.source_type = 'architecture-pattern',
        target.classification = 'internal',
        target.status = 'active',
        target.chunk_size = &&chunk_size,
        target.chunk_overlap = &&chunk_overlap,
        target.match_limit = &&match_limit,
        target.refresh_rate_minutes = &&refresh_rate_minutes,
        target.vector_dimension = &&vector_dimension,
        target.metadata_json = json_object(
          'managedBy' value 'create_select_ai_oracle_private_index.sql',
          'objectStoragePrefix' value '*',
          'vectorDistanceMetric' value 'cosine'
        ),
        target.updated_at = systimestamp,
        target.last_refresh_requested_at = systimestamp
      when not matched then insert (
        id,
        index_name,
        display_name,
        profile_name,
        vector_table_name,
        object_storage_location,
        object_storage_credential_name,
        corpus,
        knowledge_layer,
        source_type,
        classification,
        status,
        chunk_size,
        chunk_overlap,
        match_limit,
        refresh_rate_minutes,
        vector_dimension,
        metadata_json,
        created_at,
        updated_at,
        last_refresh_requested_at
      ) values (
        source.id,
        '&&vector_index_name',
        'Oracle private field knowledge',
        '&&profile_name',
        '&&vector_table_name',
        '&&object_storage_location',
        '&&object_storage_credential_name',
        'oracle',
        'oracle-private',
        'architecture-pattern',
        'internal',
        'active',
        &&chunk_size,
        &&chunk_overlap,
        &&match_limit,
        &&refresh_rate_minutes,
        &&vector_dimension,
        json_object(
          'managedBy' value 'create_select_ai_oracle_private_index.sql',
          'objectStoragePrefix' value '*',
          'vectorDistanceMetric' value 'cosine'
        ),
        systimestamp,
        systimestamp,
        systimestamp
      )
    ~';

    dbms_output.put_line('Registered &&vector_index_name in OAA_RAG_VECTOR_INDEXES.');
  end if;
end;
/

prompt Vector index status

select index_name, status
from user_cloud_vector_indexes
where upper(index_name) = upper('&&vector_index_name');

prompt Vector index attributes

select attribute_name, dbms_lob.substr(attribute_value, 500, 1) as attribute_value
from user_cloud_vector_index_attributes
where upper(index_name) = upper('&&vector_index_name')
order by attribute_name;

prompt Vector table row count

select count(*) as vector_row_count
from &&vector_table_name;

prompt App registry status

declare
  control_table_count number;
  private_active_count number;
  public_active_count number;
begin
  select count(*)
    into control_table_count
    from user_tables
   where table_name = 'OAA_RAG_VECTOR_INDEXES';

  if control_table_count = 0 then
    dbms_output.put_line('OAA_RAG_VECTOR_INDEXES not found; skipping app registry verification.');
  else
    execute immediate q'[
      select count(*)
      from oaa_rag_vector_indexes
      where index_name = 'OAA_ORACLE_PRIVATE_RAG_IDX'
        and knowledge_layer = 'oracle-private'
        and classification = 'internal'
        and status = 'active'
    ]' into private_active_count;

    execute immediate q'[
      select count(*)
      from oaa_rag_vector_indexes
      where index_name = 'OAA_ORACLE_PUBLIC_RAG_IDX'
        and status = 'active'
    ]' into public_active_count;

    dbms_output.put_line('Private active registry rows: ' || private_active_count);
    dbms_output.put_line('Public active registry rows: ' || public_active_count);
  end if;
end;
/

prompt Done. If vector_row_count is greater than 0, configured Object Storage objects have been vectorized as oracle-private knowledge.
