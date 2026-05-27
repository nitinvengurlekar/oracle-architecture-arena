<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This is the main project thread for SEAssist.

Use this space for:

- overall project direction

- major decisions

- shared notes

- links between the UI and structural work

Do not do detailed UI cleanup here.

Do not do detailed backend / vector / ADB 26ai work here.

If a decision affects both UI and structural work, record it here in a short summary.
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Source-of-truth layout

Use `/Users/NVENGURL/oracle-architecture-arena-deployment` as the source-of-truth repo and working directory.

The Next.js app is rooted here:
- `src/app` for routes and API handlers
- `src/components` for UI surfaces
- `src/lib` for app logic, prompt orchestration, data access helpers, and generation flows
- `package.json`, `next.config.ts`, and deploy/build commands at the repo root

The `ui/` and `structural/` folders are workstream instruction folders only. Do not treat either folder as a separate application root unless the project is intentionally migrated later.
<!-- END:nextjs-agent-rules -->
