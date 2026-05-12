# Production Config Pass

Date: 2026-05-12
Branch: `codex/deployment-hardening`
Worktree: `/Users/NVENGURL/oracle-architecture-arena-deployment`

## Scope

Verified the app for OCI VM deployment readiness before adding database persistence.

## Findings

- Next.js App Router production build succeeds.
- API routes use the Node.js runtime, which is required for server-side OpenAI calls and future Oracle Database drivers.
- OpenAI secrets are read only from server-side environment variables.
- No `NEXT_PUBLIC_` OpenAI variables are used.
- `.env.local` is ignored and untracked.
- `.env.local.example` is a safe sample file.

## Config Decisions

- Enabled `output: "standalone"` in `next.config.ts` so an OCI VM can run the traced production server without shipping the entire development dependency tree.
- Disabled the `x-powered-by` header with `poweredByHeader: false`.
- Added `deploymentId: process.env.NEXT_DEPLOYMENT_ID` for version-skew protection during future rolling deployments.
- Added route duration metadata for OpenAI-backed API calls:
  - `/api/competitive-assist`: 90 seconds
  - `/api/debate-arena`: 180 seconds

## Runtime Env Shape

Required now:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_DEBATE_MODEL=
OPENAI_DEBATE_REASONING_EFFORT=
NEXT_DEPLOYMENT_ID=
HOSTNAME=
PORT=
```

Future persistence/RAG env vars will be added when the Autonomous Database and Object Storage integration is implemented.

## Build Output Expectations

After `npm run build`, the VM deployment path should include:

- `.next/standalone/server.js`
- `.next/static`
- any `public` assets if/when added

For a VM process manager, the likely start command is:

```bash
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js
```

Use Nginx, Caddy, or another reverse proxy in front of the Node process for TLS, request limits, and public routing.
