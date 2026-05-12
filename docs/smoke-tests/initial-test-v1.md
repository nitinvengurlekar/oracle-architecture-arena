# Initial Test V1

Date: 2026-05-11
Environment: local Next.js dev server at `http://localhost:3000`
Tester: Codex browser smoke test

## Customer Use Case

A state government agency is modernizing its enterprise data warehouse and is evaluating Snowflake as the centralized analytics platform for cross-department reporting and AI-driven insights. Business users want conversational analytics for natural language questions such as budget variance trends by county and procurement spending anomalies. The agency already runs mission-critical Oracle 19c databases on Exadata on-premises for finance, HR, and permitting systems, and those systems will remain systems of record because of performance, security, and regulatory requirements. The customer wants guidance on Snowflake and AI capabilities versus what they can do with existing Oracle investments.

## Smoke Test Summary

Overall result: healthy workbench shell with partial functional LLM path.

Main routes loaded without browser console errors:

- `/`
- `/scenarios`
- `/competitive-se-assist`
- `/debate-arena`
- `/architecture-generator`
- `/whiteboard-studio`

## Competitive SE Assist

Input context:

- Competitor: Snowflake
- Domain: Data platform / lakehouse
- Discovery confidence: Directional
- Raw signal: full state government Snowflake / Oracle Exadata use case

Observed behavior:

- The page called the server-side OpenAI-backed route.
- OpenAI returned `429`.
- The app fell back to the local assist engine.
- RAG context rendered, including Snowflake analytics risks and Oracle data gravity / GoldenGate guidance.
- Output was usable but more generic than expected because live LLM generation did not complete.

## Dashboard

- Dashboard loaded.
- `New scenario` routed to Competitive SE Assist.
- `Export brief` attempts a browser download. Codex in-app browser cannot validate download events, so this requires manual browser validation.

## Scenarios

- Scenario page loaded.
- Scenario cards rendered.
- `Create scenario` had no visible action.
- `Open scenario` had no visible action.

## Debate Arena

- Page loaded.
- Oracle architect, competitor architect, neutral CTO judge, scorecard, and recommendation rendered.
- Content is still static Databricks scenario data and does not yet consume the current SE Assist output.

## Architecture Generator

- Page loaded.
- ReactFlow diagram rendered.
- OCI architecture cards rendered.
- Clicking an architecture card updated the visible detail.
- Blueprint is still static and does not yet consume the current Debate Arena output.

## Whiteboard Studio

- Page loaded.
- tldraw canvas rendered.
- Architecture notes rendered.
- `Export package` worked and reported `Exported package with 3 notes`.
- Sketch-to-architecture AI handoff remains a future hook.

## Follow-Up Items

1. Resolve OpenAI `429` before rerunning live SE Assist generation.
2. Persist generated SE Assist output across tabs.
3. Feed SE Assist output into Debate Arena.
4. Feed Debate Arena recommendation into Architecture Generator.
5. Turn Scenario actions into real workflow actions.

## OpenAI Key Validation

Validation run after the smoke test:

- `GET /v1/models` returned HTTP `200`.
- The local project key authenticated successfully.
- Configured model `gpt-5.4-mini` was visible to the project.
- A minimal `gpt-5.5` Responses API call returned HTTP `429` with error code `insufficient_quota`.

Conclusion: the key is valid and the configured model is available. The observed `429` is quota/billing/spend-limit related rather than a malformed key or unavailable model.

## Next Smoke Test Requirement

Record the entire next smoke test execution for team playback, including:

- Scenario entry
- SE Assist generation
- Debate Arena walkthrough
- Architecture Generator walkthrough
- Whiteboard Studio export/handoff check
- Any observed errors or fallback states
