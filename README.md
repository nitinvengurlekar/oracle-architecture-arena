# Oracle Architecture Arena

Source-of-truth repo for the SEAssist / Oracle Architecture Arena workbench.

## Project Layout

- `src/app`: Next.js routes, pages, and API handlers
- `src/components`: dashboard and workbench UI components
- `src/lib`: generation flows, prompt orchestration, contracts, database helpers, and shared app logic
- `src/data`: local fixtures, starter content, and fallback workbench data
- `public`: static assets
- `ui`: UI workstream instructions only; not a separate app root
- `structural`: structural/backend workstream instructions only; not a separate app root

## Future Work Routing

Request UI-facing changes here in the parent repo, even when the work belongs to the UI thread. That includes page layout, component cleanup, navigation, styling, usability, and frontend-facing prompt behavior such as Debate Arena agent instructions.

Use the structural workstream for backend/platform changes such as database shape, retrieval, embeddings, Oracle ADB 26ai, ingestion, and API contracts that are primarily backend-owned.

If a change touches both UI and structure, make the source-of-truth change in this repo and leave a short note in the relevant workstream guidance.

## Local Commands

```bash
npm run dev
npm run lint
npm run build
```

Open `http://localhost:3000` after starting the dev server.
