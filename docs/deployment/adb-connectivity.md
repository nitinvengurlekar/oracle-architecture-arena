# ADB Connectivity Foundation

Date: 2026-05-13
Branch: `codex/deployment-hardening`

This is the first code slice for connecting Oracle Architecture Arena to Autonomous Database.

## Where The Pieces Live

- Oracle Database driver dependency: `oracledb`
- Server-only connection helper: `src/lib/db/oracle.ts`
- Health route: `src/app/api/health/database/route.ts`
- Route URL: `/api/health/database`

The helper is only imported by server route code. It should not be imported by client components.

## Wallet Handling

Do not upload `wallet.zip` into the project and do not commit it.

For the VM, unzip the wallet outside the repo. A good path is:

```text
/opt/oracle/wallets/oracle-architecture-arena/
```

For node-oracledb Thin mode with ADB mTLS, the app expects:

- `tnsnames.ora` in the config directory
- `ewallet.pem` in the wallet directory

These are often the same unzipped wallet directory.

## Runtime Environment Variables

Set these on the VM or in local `.env.local`:

```env
ORACLE_DB_USER=
ORACLE_DB_PASSWORD=
ORACLE_DB_CONNECT_STRING=
ORACLE_DB_WALLET_LOCATION=
ORACLE_DB_WALLET_PASSWORD=
ORACLE_DB_CONFIG_DIR=
ORACLE_DB_POOL_MIN=1
ORACLE_DB_POOL_MAX=4
ORACLE_DB_POOL_INCREMENT=1
```

Notes:

- `ORACLE_DB_CONNECT_STRING` can be a TNS alias from `tnsnames.ora`, such as the `_low`, `_medium`, or `_high` service.
- `ORACLE_DB_CONFIG_DIR` is optional. If omitted, it defaults to `ORACLE_DB_WALLET_LOCATION`.
- `ORACLE_DB_WALLET_PASSWORD` is optional in code, but may be required depending on the wallet file.

## Health Route Behavior

`GET /api/health/database` returns:

- `200` when the app connects to ADB and runs a small `dual` query.
- `503` when required environment variables or wallet files are missing.
- `500` when configuration exists but the database connection fails.

The response intentionally does not return passwords, wallet paths, or connect strings.
