-- Oracle Architecture Arena Select AI RAG control plane.
-- Applies after 001_initial_adb_schema.sql.
-- Keeps app-owned governance metadata separate from Oracle-managed vector stores.

alter table oaa_knowledge_documents drop constraint oaa_knowledge_docs_status_ck;

alter table oaa_knowledge_documents add (
  corpus varchar2(80),
  knowledge_layer varchar2(40) default 'oracle-private' not null,
  sensitivity varchar2(40),
  freshness varchar2(40),
  product_area varchar2(120),
  source_uri varchar2(2048),
  source_version varchar2(240),
  extraction_method varchar2(80),
  enrichment_confidence number(5, 2),
  last_vectorized_at timestamp with time zone
);

alter table oaa_knowledge_documents add constraint oaa_knowledge_docs_status_ck check (
  status in (
    'draft',
    'discovered',
    'processing',
    'extracting',
    'enriching',
    'chunking',
    'embedded',
    'active',
    'archived',
    'failed',
    'skipped'
  )
);

alter table oaa_knowledge_documents add constraint oaa_knowledge_docs_layer_ck check (
  knowledge_layer in ('legacy', 'oracle-public', 'oracle-private', 'scenario')
);

alter table oaa_knowledge_documents add constraint oaa_knowledge_docs_sensitivity_ck check (
  sensitivity is null or sensitivity in ('public', 'internal', 'confidential', 'restricted')
);

alter table oaa_knowledge_documents add constraint oaa_knowledge_docs_freshness_ck check (
  freshness is null or freshness in ('current', 'watch', 'stale', 'unknown')
);

create index oaa_knowledge_docs_corpus_ix on oaa_knowledge_documents (corpus);
create index oaa_knowledge_docs_layer_ix on oaa_knowledge_documents (knowledge_layer);
create index oaa_knowledge_docs_product_ix on oaa_knowledge_documents (product_area);

create table oaa_rag_vector_indexes (
  id varchar2(64) primary key,
  index_name varchar2(125) not null,
  display_name varchar2(240) not null,
  profile_name varchar2(125) not null,
  vector_table_name varchar2(125),
  object_storage_location varchar2(2048) not null,
  object_storage_credential_name varchar2(125) not null,
  corpus varchar2(80) not null,
  knowledge_layer varchar2(40) not null,
  source_type varchar2(40) not null,
  strategy_domain varchar2(40),
  competitor varchar2(40),
  classification varchar2(40) default 'internal' not null,
  status varchar2(30) default 'planned' not null,
  chunk_size number,
  chunk_overlap number,
  match_limit number,
  refresh_rate_minutes number,
  vector_dimension number,
  metadata_json json,
  created_at timestamp with time zone default systimestamp not null,
  updated_at timestamp with time zone default systimestamp not null,
  last_refresh_requested_at timestamp with time zone,
  constraint oaa_rag_vector_indexes_name_uq unique (index_name),
  constraint oaa_rag_vector_indexes_layer_ck check (
    knowledge_layer in ('legacy', 'oracle-public', 'oracle-private', 'scenario')
  ),
  constraint oaa_rag_vector_indexes_source_ck check (
    source_type in (
      'oracle-capability',
      'competitive-context',
      'architecture-pattern',
      'governance-pattern',
      'customer-document',
      'smoke-test'
    )
  ),
  constraint oaa_rag_vector_indexes_domain_ck check (
    strategy_domain is null or strategy_domain in (
      'database-modernization',
      'ai-ml-platform',
      'lakehouse-modernization',
      'sovereign-deployment',
      'cross-domain'
    )
  ),
  constraint oaa_rag_vector_indexes_competitor_ck check (
    competitor is null or competitor in (
      'Databricks',
      'Snowflake',
      'AWS',
      'Azure',
      'Google Cloud',
      'Other'
    )
  ),
  constraint oaa_rag_vector_indexes_class_ck check (
    classification in ('public', 'internal', 'confidential', 'restricted')
  ),
  constraint oaa_rag_vector_indexes_status_ck check (
    status in ('planned', 'creating', 'active', 'disabled', 'failed', 'retired')
  )
);

create index oaa_rag_vector_indexes_layer_ix on oaa_rag_vector_indexes (knowledge_layer);
create index oaa_rag_vector_indexes_class_ix on oaa_rag_vector_indexes (classification);
create index oaa_rag_vector_indexes_status_ix on oaa_rag_vector_indexes (status);
create index oaa_rag_vector_indexes_domain_ix on oaa_rag_vector_indexes (strategy_domain);
