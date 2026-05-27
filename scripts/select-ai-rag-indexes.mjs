#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

import oracledb from "oracledb"

const command = process.argv[2] ?? "plan"
const cwd = process.cwd()

loadDotEnv(path.join(cwd, ".env.local"))

if (!["plan", "create"].includes(command)) {
  console.error("Usage: node scripts/select-ai-rag-indexes.mjs [plan|create]")
  process.exit(1)
}

const indexes = buildIndexConfigs()

if (command === "plan") {
  console.log(JSON.stringify({ indexes }, null, 2))
  process.exit(0)
}

const connection = await getConnection()

try {
  await disableReplacedVectorIndexes(connection)

  for (const indexConfig of indexes) {
    await registerVectorIndex(connection, indexConfig, "creating")
    await createOrEnableVectorIndex(connection, indexConfig)
    await setProfileVectorIndex(connection, indexConfig)
    await registerVectorIndex(connection, indexConfig, "active")
    console.log(`Registered Select AI vector index ${indexConfig.indexName}`)
  }

  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.close()
}

function buildIndexConfigs() {
  const profileName = requireEnv("SELECT_AI_PROFILE_NAME")
  const objectStorageCredentialName = requireEnv(
    "SELECT_AI_OBJECT_STORAGE_CREDENTIAL_NAME"
  )
  const vectorDimension = readOptionalNumber("SELECT_AI_VECTOR_DIMENSION")
  const refreshRate = readNumber("SELECT_AI_VECTOR_REFRESH_RATE", 1440)
  const chunkSize = readNumber("SELECT_AI_VECTOR_CHUNK_SIZE", 2048)
  const chunkOverlap = readNumber("SELECT_AI_VECTOR_CHUNK_OVERLAP", 256)
  const matchLimit = readNumber("SELECT_AI_VECTOR_MATCH_LIMIT", 5)
  const vectorDistanceMetric =
    process.env.SELECT_AI_VECTOR_DISTANCE_METRIC?.trim() || "cosine"

  return [
    {
      id: stableId("oaa-oracle-private-rag"),
      indexName: "OAA_ORACLE_PRIVATE_RAG_IDX",
      displayName: "Oracle private field knowledge",
      corpus: "oracle",
      knowledgeLayer: "oracle-private",
      classification: "internal",
      sourceType: "architecture-pattern",
      prefix: process.env.SELECT_AI_ORACLE_PRIVATE_PREFIX ?? "*",
    },
  ]
    .filter((indexConfig) => indexConfig.prefix.trim().length > 0)
    .map((indexConfig) => ({
      ...indexConfig,
      profileName,
      objectStorageCredentialName,
      location: buildObjectStorageLocation(indexConfig.prefix),
      vectorTableName: `${indexConfig.indexName.replace(/_IDX$/, "")}_TAB`,
      vectorDimension,
      vectorDistanceMetric,
      refreshRate,
      chunkSize,
      chunkOverlap,
      matchLimit,
    }))
}

async function createOrEnableVectorIndex(connection, indexConfig) {
  if (await vectorIndexExists(connection, indexConfig.indexName)) {
    await connection.execute(
      `begin
        DBMS_CLOUD_AI.ENABLE_VECTOR_INDEX(index_name => :indexName);
      end;`,
      { indexName: indexConfig.indexName }
    )
    return
  }

  const attributes = {
    vector_db_provider: "oracle",
    vector_table_name: indexConfig.vectorTableName,
    location: indexConfig.location,
    object_storage_credential_name: indexConfig.objectStorageCredentialName,
    profile_name: indexConfig.profileName,
    vector_distance_metric: indexConfig.vectorDistanceMetric,
    chunk_size: indexConfig.chunkSize,
    chunk_overlap: indexConfig.chunkOverlap,
    match_limit: indexConfig.matchLimit,
    refresh_rate: indexConfig.refreshRate,
    enable_sources: true,
    ...(indexConfig.vectorDimension
      ? { vector_dimension: indexConfig.vectorDimension }
      : {}),
  }

  await connection.execute(
    `begin
      DBMS_CLOUD_AI.CREATE_VECTOR_INDEX(
        index_name => :indexName,
        attributes => :attributes,
        status => 'Enabled'
      );
    end;`,
    {
      indexName: indexConfig.indexName,
      attributes: JSON.stringify(attributes),
    }
  )
}

async function setProfileVectorIndex(connection, indexConfig) {
  await connection.execute(
    `begin
      DBMS_CLOUD_AI.SET_ATTRIBUTE(
        profile_name => :profileName,
        attribute_name => 'vector_index_name',
        attribute_value => :indexName
      );
    end;`,
    {
      profileName: indexConfig.profileName,
      indexName: indexConfig.indexName,
    }
  )
}

async function vectorIndexExists(connection, indexName) {
  const result = await connection.execute(
    `select count(*) as index_count
    from user_cloud_vector_indexes
    where upper(index_name) = upper(:indexName)`,
    { indexName }
  )
  const row = result.rows?.[0]

  if (!row) {
    return false
  }

  return Number(row.INDEX_COUNT ?? 0) > 0
}

async function disableReplacedVectorIndexes(connection) {
  await connection.execute(
    `update oaa_rag_vector_indexes
    set status = 'disabled',
      updated_at = systimestamp
    where index_name in ('OAA_ORACLE_PUBLIC_RAG_IDX', 'OAA_LEGACY_RAG_IDX')
      and status = 'active'`
  )
}

async function registerVectorIndex(connection, indexConfig, status) {
  await connection.execute(
    `merge into oaa_rag_vector_indexes target
    using (select :id as id from dual) source
      on (target.id = source.id)
    when matched then update set
      target.index_name = :indexName,
      target.display_name = :displayName,
      target.profile_name = :profileName,
      target.vector_table_name = :vectorTableName,
      target.object_storage_location = :location,
      target.object_storage_credential_name = :objectStorageCredentialName,
      target.corpus = :corpus,
      target.knowledge_layer = :knowledgeLayer,
      target.source_type = :sourceType,
      target.classification = :classification,
      target.status = :status,
      target.chunk_size = :chunkSize,
      target.chunk_overlap = :chunkOverlap,
      target.match_limit = :matchLimit,
      target.refresh_rate_minutes = :refreshRate,
      target.vector_dimension = :vectorDimension,
      target.metadata_json = :metadataJson,
      target.updated_at = systimestamp,
      target.last_refresh_requested_at = case
        when :status = 'creating' then systimestamp
        else target.last_refresh_requested_at
      end
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
      :id,
      :indexName,
      :displayName,
      :profileName,
      :vectorTableName,
      :location,
      :objectStorageCredentialName,
      :corpus,
      :knowledgeLayer,
      :sourceType,
      :classification,
      :status,
      :chunkSize,
      :chunkOverlap,
      :matchLimit,
      :refreshRate,
      :vectorDimension,
      :metadataJson,
      systimestamp,
      systimestamp,
      case when :status = 'creating' then systimestamp else null end
    )`,
    {
      id: indexConfig.id,
      indexName: indexConfig.indexName,
      displayName: indexConfig.displayName,
      profileName: indexConfig.profileName,
      vectorTableName: indexConfig.vectorTableName,
      location: indexConfig.location,
      objectStorageCredentialName: indexConfig.objectStorageCredentialName,
      corpus: indexConfig.corpus,
      knowledgeLayer: indexConfig.knowledgeLayer,
      sourceType: indexConfig.sourceType,
      classification: indexConfig.classification,
      status,
      chunkSize: indexConfig.chunkSize,
      chunkOverlap: indexConfig.chunkOverlap,
      matchLimit: indexConfig.matchLimit,
      refreshRate: indexConfig.refreshRate,
      vectorDimension: indexConfig.vectorDimension,
      metadataJson: {
        type: oracledb.DB_TYPE_JSON,
        val: {
          managedBy: "select-ai-rag-indexes.mjs",
          objectStoragePrefix: indexConfig.prefix,
          vectorDistanceMetric: indexConfig.vectorDistanceMetric,
        },
      },
    }
  )
}

async function getConnection() {
  const driverMode = process.env.ORACLE_DB_DRIVER_MODE?.trim() || "thin"
  const user = requireEnv("ORACLE_DB_USER")
  const password = requireEnv("ORACLE_DB_PASSWORD")
  const connectString = requireEnv("ORACLE_DB_CONNECT_STRING")
  const walletLocation = requireEnv("ORACLE_DB_WALLET_LOCATION")
  const configDir = process.env.ORACLE_DB_CONFIG_DIR?.trim() || walletLocation

  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

  if (driverMode === "thick") {
    oracledb.initOracleClient({
      configDir,
      ...(process.env.ORACLE_CLIENT_LIB_DIR
        ? { libDir: process.env.ORACLE_CLIENT_LIB_DIR }
        : {}),
    })
  }

  return oracledb.getConnection({
    user,
    password,
    connectString,
    configDir,
    walletLocation,
    walletPassword: process.env.ORACLE_DB_WALLET_PASSWORD,
  })
}

function buildObjectStorageLocation(prefix) {
  const trimmedPrefix = prefix.trim()

  if (/^https?:\/\//i.test(trimmedPrefix)) {
    return trimmedPrefix
  }

  const region = requireEnv("OCI_REGION")
  const namespace = requireEnv("OCI_OBJECT_NAMESPACE")
  const bucket = requireEnv("OCI_KNOWLEDGE_BUCKET")
  const normalizedPrefix = trimmedPrefix.replace(/^\/+/, "")
  const wildcard = normalizedPrefix.endsWith("*")
    ? normalizedPrefix
    : `${normalizedPrefix}*`

  return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucket}/o/${wildcard}`
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const contents = fs.readFileSync(filePath, "utf8")

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value.replace(/^["']|["']$/g, "")
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required.`)
  }

  return value
}

function readNumber(name, fallback) {
  const value = process.env[name]?.trim()

  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number.`)
  }

  return parsed
}

function readOptionalNumber(name) {
  const value = process.env[name]?.trim()

  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number.`)
  }

  return parsed
}

function stableId(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32)
}
