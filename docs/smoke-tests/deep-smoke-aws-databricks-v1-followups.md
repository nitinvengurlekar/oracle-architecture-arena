# Deep Smoke Test Follow-Ups: AWS + Databricks V1

Date: 2026-05-11
Source run: `docs/smoke-tests/deep-smoke-aws-databricks-v1.md`

## Findings

### Important

- Architecture Generator shows a Debate Arena integration pattern, but the visible blueprint still reads as a mostly generic OCI/Databricks architecture. It should carry forward the specific AWS, transportation/tolling, Tableau, Looker, and public-sector constraints from the selected use case.

### Minor

- Debate Arena no longer shows the `OpenAI debate high reasoning` detail as a static box, which is good, but the automated hover capture did not show a visible tooltip over `Generate debate`. Verify whether the hover affordance is visible enough for users.
- Dashboard `Export brief` is present, but the Codex in-app browser cannot observe download events. Validate the actual file download once in a normal browser.
- Competitive SE Assist long-text typing could not be exercised through the in-app browser automation because long-field input hit a virtual clipboard limitation. The page generation path was tested with the template-prefill URL instead.
- Whiteboard `Export package` updates export status in the UI, but the smoke test did not observe a downloadable package artifact.

### Planned Capability

- Whiteboard Studio exposes the future sketch-to-architecture AI handoff, but it does not yet generate architecture output from sketches.
- Persistence is still local/client-side. Before Vercel or Oracle Cloud VM hosting, use case catalog persistence should move to a backend database.
- RAG is still prepared through local/mock corpus wiring. The next platform step is to connect Oracle document retrieval, embeddings, and source citations.

## Suggested Next Pass

1. Make Architecture Generator consume the selected Debate Arena result and customer-specific context directly.
2. Add a visible, accessible tooltip or compact status label for Debate Arena model/reasoning settings.
3. Validate Dashboard export in a regular browser and record the downloaded JSON/Markdown artifact.
4. Decide whether Whiteboard export should download an actual package or remain a status-only placeholder for now.
5. Add backend persistence for generated use cases before external hosting.
