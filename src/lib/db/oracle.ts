import "server-only"

import fs from "node:fs"
import path from "node:path"

import oracledb from "oracledb"

const POOL_ALIAS = "oracle-architecture-arena"

type OracleDriverMode = "thin" | "thick"

type OracleDbConfig = {
  driverMode: OracleDriverMode
  user: string
  password: string
  connectString: string
  configDir: string
  walletLocation: string
  walletPassword?: string
  clientLibDir?: string
  poolMin: number
  poolMax: number
  poolIncrement: number
}

type OracleDbConfigStatus =
  | {
      configured: true
      config: OracleDbConfig
      missingEnvironment: []
      missingWalletFiles: []
    }
  | {
      configured: false
      config?: Partial<OracleDbConfig>
      missingEnvironment: string[]
      missingWalletFiles: string[]
    }

export type OracleDatabaseHealth = {
  status: "ok" | "not_configured" | "error"
  checkedAt: string
  configured: boolean
  driver: {
    name: "oracledb"
    version: string
    mode: OracleDriverMode
    requestedMode: OracleDriverMode
  }
  connection: {
    connectStringConfigured: boolean
    connectStringKind: "tns-alias" | "connect-descriptor-or-easy-connect" | "missing"
  }
  wallet: {
    configDirConfigured: boolean
    walletLocationConfigured: boolean
    requiredFiles: string[]
    missingFiles: string[]
  }
  pool: {
    min: number
    max: number
    increment: number
  }
  database?: {
    currentUser?: string
    currentSchema?: string
    databaseName?: string
  }
  missingEnvironment?: string[]
  error?: {
    code?: string
    message: string
  }
}

type HealthQueryRow = {
  CURRENT_USER?: string
  CURRENT_SCHEMA?: string
  DATABASE_NAME?: string
}

let poolPromise: Promise<oracledb.Pool> | undefined
let thickClientInitialized = false

export class OracleDatabaseConfigurationError extends Error {
  constructor(
    readonly missingEnvironment: string[],
    readonly missingWalletFiles: string[]
  ) {
    super("Oracle Database is not configured.")
    this.name = "OracleDatabaseConfigurationError"
  }
}

export async function withOracleConnection<T>(
  operation: (connection: oracledb.Connection) => Promise<T>
) {
  const configStatus = readOracleDbConfig()

  if (!configStatus.configured) {
    throw new OracleDatabaseConfigurationError(
      configStatus.missingEnvironment,
      configStatus.missingWalletFiles
    )
  }

  const pool = await getOraclePool(configStatus.config)
  const connection = await pool.getConnection()

  try {
    return await operation(connection)
  } finally {
    await connection.close()
  }
}

export async function checkOracleDatabaseHealth(): Promise<OracleDatabaseHealth> {
  const configStatus = readOracleDbConfig()
  const checkedAt = new Date().toISOString()

  if (!configStatus.configured) {
    return {
      status: "not_configured",
      checkedAt,
      configured: false,
      driver: getDriverHealth(configStatus.config),
      connection: getConnectionHealth(configStatus.config),
      wallet: getWalletHealth(configStatus.config, configStatus.missingWalletFiles),
      pool: getPoolHealth(configStatus.config),
      missingEnvironment: configStatus.missingEnvironment,
    }
  }

  try {
    const pool = await getOraclePool(configStatus.config)
    const connection = await pool.getConnection()

    try {
      const result = await connection.execute<HealthQueryRow>(
        `select
          sys_context('USERENV', 'CURRENT_USER') as current_user,
          sys_context('USERENV', 'CURRENT_SCHEMA') as current_schema,
          sys_context('USERENV', 'DB_NAME') as database_name
        from dual`
      )
      const row = result.rows?.[0]

      return {
        status: "ok",
        checkedAt,
        configured: true,
        driver: getDriverHealth(configStatus.config),
        connection: getConnectionHealth(configStatus.config),
        wallet: getWalletHealth(configStatus.config, []),
        pool: getPoolHealth(configStatus.config),
        database: {
          currentUser: row?.CURRENT_USER,
          currentSchema: row?.CURRENT_SCHEMA,
          databaseName: row?.DATABASE_NAME,
        },
      }
    } finally {
      await connection.close()
    }
  } catch (error) {
    return {
      status: "error",
      checkedAt,
      configured: true,
      driver: getDriverHealth(configStatus.config),
      connection: getConnectionHealth(configStatus.config),
      wallet: getWalletHealth(configStatus.config, []),
      pool: getPoolHealth(configStatus.config),
      error: normalizeOracleError(error, configStatus.config),
    }
  }
}

async function getOraclePool(config: OracleDbConfig) {
  if (!poolPromise) {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT
    initializeOracleClient(config)

    poolPromise = oracledb
      .createPool(getPoolOptions(config))
      .catch((error) => {
        poolPromise = undefined
        throw error
      })
  }

  return poolPromise
}

function initializeOracleClient(config: OracleDbConfig) {
  if (config.driverMode !== "thick" || thickClientInitialized) {
    return
  }

  const clientOptions: oracledb.InitialiseOptions = {
    configDir: config.configDir,
    driverName: "Oracle Architecture Arena : Next.js",
  }

  if (config.clientLibDir) {
    clientOptions.libDir = config.clientLibDir
  }

  oracledb.initOracleClient(clientOptions)
  thickClientInitialized = true
}

function getPoolOptions(config: OracleDbConfig): oracledb.PoolAttributes {
  const sharedOptions: oracledb.PoolAttributes = {
        user: config.user,
        password: config.password,
        connectString: config.connectString,
        poolAlias: POOL_ALIAS,
        poolMin: config.poolMin,
        poolMax: config.poolMax,
        poolIncrement: config.poolIncrement,
        queueTimeout: 5000,
  }

  if (config.driverMode === "thick") {
    return sharedOptions
  }

  return {
    ...sharedOptions,
    configDir: config.configDir,
    walletLocation: config.walletLocation,
    walletPassword: config.walletPassword,
    connectTimeout: 5,
    transportConnectTimeout: 5,
  }
}

function readOracleDbConfig(): OracleDbConfigStatus {
  const driverMode = readDriverMode(readEnv("ORACLE_DB_DRIVER_MODE"))
  const user = readEnv("ORACLE_DB_USER")
  const password = readEnv("ORACLE_DB_PASSWORD")
  const connectString = readEnv("ORACLE_DB_CONNECT_STRING")
  const walletLocation = readEnv("ORACLE_DB_WALLET_LOCATION")
  const configDir = readEnv("ORACLE_DB_CONFIG_DIR") || walletLocation
  const walletPassword = readEnv("ORACLE_DB_WALLET_PASSWORD")
  const clientLibDir = readEnv("ORACLE_CLIENT_LIB_DIR")
  const requiredEnvironment: Array<[string, string | undefined]> = [
    ["ORACLE_DB_USER", user],
    ["ORACLE_DB_PASSWORD", password],
    ["ORACLE_DB_CONNECT_STRING", connectString],
    ["ORACLE_DB_WALLET_LOCATION", walletLocation],
  ]
  const missingEnvironment = requiredEnvironment.flatMap(([name, value]) =>
    value ? [] : [name]
  )

  const config: Partial<OracleDbConfig> = {
    driverMode,
    user,
    password,
    connectString,
    configDir,
    walletLocation,
    walletPassword,
    clientLibDir,
    poolMin: readNumberEnv("ORACLE_DB_POOL_MIN", 1),
    poolMax: readNumberEnv("ORACLE_DB_POOL_MAX", 4),
    poolIncrement: readNumberEnv("ORACLE_DB_POOL_INCREMENT", 1),
  }
  const missingWalletFiles = getMissingWalletFiles(config)

  if (missingEnvironment.length > 0 || missingWalletFiles.length > 0) {
    return {
      configured: false,
      config,
      missingEnvironment,
      missingWalletFiles,
    }
  }

  return {
    configured: true,
    config: config as OracleDbConfig,
    missingEnvironment: [],
    missingWalletFiles: [],
  }
}

function getMissingWalletFiles(config?: Partial<OracleDbConfig>) {
  const missingFiles: string[] = []

  if (config?.configDir && !fs.existsSync(path.join(config.configDir, "tnsnames.ora"))) {
    missingFiles.push("tnsnames.ora")
  }

  if (config?.driverMode === "thick") {
    if (config.configDir && !fs.existsSync(path.join(config.configDir, "sqlnet.ora"))) {
      missingFiles.push("sqlnet.ora")
    }

    if (
      config.walletLocation &&
      !fs.existsSync(path.join(config.walletLocation, "cwallet.sso"))
    ) {
      missingFiles.push("cwallet.sso")
    }
  } else if (
    config?.walletLocation &&
    !fs.existsSync(path.join(config.walletLocation, "ewallet.pem"))
  ) {
    missingFiles.push("ewallet.pem")
  }

  return missingFiles
}

function getDriverHealth(config?: Partial<OracleDbConfig>) {
  return {
    name: "oracledb" as const,
    version: oracledb.versionString,
    mode: oracledb.thin ? ("thin" as const) : ("thick" as const),
    requestedMode: config?.driverMode ?? "thin",
  }
}

function getConnectionHealth(config?: Partial<OracleDbConfig>) {
  return {
    connectStringConfigured: Boolean(config?.connectString),
    connectStringKind: getConnectStringKind(config?.connectString),
  }
}

function getWalletHealth(
  config: Partial<OracleDbConfig> | undefined,
  missingFiles: string[]
) {
  return {
    configDirConfigured: Boolean(config?.configDir),
    walletLocationConfigured: Boolean(config?.walletLocation),
    requiredFiles:
      config?.driverMode === "thick"
        ? ["tnsnames.ora", "sqlnet.ora", "cwallet.sso"]
        : ["tnsnames.ora", "ewallet.pem"],
    missingFiles,
  }
}

function getPoolHealth(config?: Partial<OracleDbConfig>) {
  return {
    min: config?.poolMin ?? 1,
    max: config?.poolMax ?? 4,
    increment: config?.poolIncrement ?? 1,
  }
}

function getConnectStringKind(value: string | undefined) {
  if (!value) {
    return "missing" as const
  }

  return /[()/]/.test(value)
    ? ("connect-descriptor-or-easy-connect" as const)
    : ("tns-alias" as const)
}

function readEnv(name: string) {
  const value = process.env[name]?.trim()

  return value ? value : undefined
}

function readNumberEnv(name: string, fallback: number) {
  const rawValue = readEnv(name)

  if (!rawValue) {
    return fallback
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallback
}

function readDriverMode(value: string | undefined): OracleDriverMode {
  return value?.toLowerCase() === "thick" ? "thick" : "thin"
}

function normalizeOracleError(error: unknown, config: OracleDbConfig) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "errorNum" in error &&
    typeof error.errorNum === "number"
      ? `ORA-${error.errorNum}`
      : typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
        ? error.code
      : undefined
  const message =
    error instanceof Error ? redactConfigValues(error.message, config) : "Unknown Oracle Database error."

  return {
    code,
    message,
  }
}

function redactConfigValues(value: string, config: OracleDbConfig) {
  const sensitiveValues: Array<string | undefined> = [
    config.password,
    config.walletPassword,
    config.connectString,
    config.configDir,
    config.walletLocation,
    config.clientLibDir,
  ]

  return sensitiveValues.reduce<string>((nextValue, sensitiveValue) => {
    return sensitiveValue
      ? nextValue.replaceAll(sensitiveValue, "[redacted]")
      : nextValue
  }, value)
}
