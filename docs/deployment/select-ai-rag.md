# Select AI RAG Vector Indexing

Date: 2026-05-26
Branch: `codex/deployment-hardening`

Oracle Architecture Arena uses Select AI RAG only for Oracle-private knowledge in the current backend path. The existing in-app RAG corpus remains the trusted baseline for public and legacy context.

## Direction

- Originals stay in OCI Object Storage.
- `DBMS_CLOUD_AI.CREATE_VECTOR_INDEX` creates an Oracle-managed vector store from the approved Object Storage wildcard: `https://objectstorage.us-chicago-1.oraclecloud.com/n/orasenatdpublicsector06/b/SEAssistCollateral/o/*`.
- Competitive SE Assist can use `OAA_ORACLE_PRIVATE_RAG_IDX` directly from environment configuration; `oaa_rag_vector_indexes` is optional future routing metadata.
- Competitive SE Assist queries Select AI only for Oracle-private context when `SELECT_AI_RAG_ENABLED=true`; otherwise it falls back to the local TypeScript corpus.
- `DBMS_VECTOR_CHAIN` remains the escape hatch for custom extraction, chunking, reranking, or OCR sidecar flows.

## First Index

For the first pass, create only the private Select AI index against the approved Object Storage wildcard. Run the grants as `ADMIN`, then run the private-index script as `OAA_APP`:

```sql
-- ADMIN
define app_user = OAA_APP
@db/admin/grant_select_ai_rag_oa_app.sql

-- OAA_APP
@db/admin/create_select_ai_oracle_private_index.sql
```

[create_select_ai_oracle_private_index.sql](/Users/NVENGURL/oracle-architecture-arena-deployment/db/admin/create_select_ai_oracle_private_index.sql) creates or updates the `SEAssist_RAG_PROFILE` profile, creates/enables `OAA_ORACLE_PRIVATE_RAG_IDX`, waits for vectorization by default, attaches the private vector index to the profile, registers the index in `oaa_rag_vector_indexes` when migration `002` is present, disables replaced public/legacy registry rows if that table exists, and prints verification queries.

Because the configured location uses `/o/*`, everything matched in that bucket path is treated as `oracle-private` knowledge by the app registry. Keep that bucket scope curated for approved private RAG content.

The Node admin script can be used later when we want the same private-only operation from environment configuration. It creates one default vector index:

- `OAA_ORACLE_PRIVATE_RAG_IDX` from `SELECT_AI_ORACLE_PRIVATE_PREFIX`

Run a dry plan:

```bash
npm run rag:select-ai:plan
```

Create/register indexes:

```bash
npm run rag:select-ai:create
```

## Required Environment For The Node Script

```env
SELECT_AI_RAG_ENABLED=true
SELECT_AI_PROFILE_NAME=
SELECT_AI_VECTOR_INDEX_NAME=OAA_ORACLE_PRIVATE_RAG_IDX
SELECT_AI_OBJECT_STORAGE_CREDENTIAL_NAME=
OCI_REGION=
OCI_OBJECT_NAMESPACE=
OCI_KNOWLEDGE_BUCKET=
```

For runtime retrieval, the app needs `SELECT_AI_RAG_ENABLED=true`, `SELECT_AI_PROFILE_NAME=SEAssist_RAG_PROFILE`, and `SELECT_AI_VECTOR_INDEX_NAME=OAA_ORACLE_PRIVATE_RAG_IDX`. The app will use those values directly when `oaa_rag_vector_indexes` does not exist or has no active private row.

For the Node script, the Select AI profile and Object Storage credential must already exist in ADB. The focused SQL script above creates or updates the profile directly. Apply `db/migrations/002_select_ai_rag_control_plane.sql` later only if you want the optional app registry table populated.

## Grants For OAA_APP

Run [grant_select_ai_rag_oa_app.sql](/Users/NVENGURL/oracle-architecture-arena-deployment/db/admin/grant_select_ai_rag_oa_app.sql) as `ADMIN` before creating the profile or vector index as `OAA_APP`:

```sql
define app_user = OAA_APP
@db/admin/grant_select_ai_rag_oa_app.sql
```

The script grants `EXECUTE` on `DBMS_CLOUD_AI`, `DBMS_CLOUD_PIPELINE`, and `DBMS_CLOUD`, gives `OAA_APP` quota for the vector store table, appends the outbound network ACL, enables `OCI$RESOURCE_PRINCIPAL` for the database user, and prints verification queries.

OCI IAM still has to be configured outside the database. The Autonomous Database resource principal needs read access to the Object Storage bucket and permission to use OCI Generative AI in the compartment that hosts the model.

## Retrieval Behavior

Competitive SE Assist queries active `oracle-private` vector indexes whose classification is `internal`, matches the selected strategy domain or `cross-domain`, and matches the selected competitor when present.

If Select AI RAG is not configured, fails, or returns no context, Assist uses the existing local corpus. This preserves demo reliability while the Oracle-native index matures.

## Future Agentic AI And MCP

This structure keeps retrieval behind ADB objects that can later become tools for Oracle Agentic AI or an MCP server. Good first tools would be `OAA_SEARCH_KNOWLEDGE`, `OAA_GET_SOURCE`, `OAA_LIST_CORPORA`, and `OAA_GET_INGEST_STATUS`, with database roles and classification filters enforcing access.
