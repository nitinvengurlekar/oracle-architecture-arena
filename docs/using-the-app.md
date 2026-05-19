# Using Oracle Architecture Arena

Oracle Architecture Arena is an AI-powered architecture decision workbench for enterprise and public-sector solution strategy teams.

## What The App Does

- Helps sales engineers and architects turn incomplete customer signals into structured strategy guidance.
- Generates Competitive SE Assist outputs, including discovery questions, Oracle positioning, competitor strengths, competitor risks, talk tracks, and battle-card guidance.
- Lets users run a Debate Arena with three perspectives:
  - Oracle Architect Agent
  - Competitor Architect Agent
  - Neutral CTO Judge
- Produces architecture recommendations and scoring based on the selected scenario.
- Generates editable architecture blueprints from saved scenarios and Debate Arena recommendations.
- Stores scenarios and generated outputs in Oracle Autonomous Database so users can return to prior work.
- Prepares the platform for future Oracle AI Database 26ai capabilities such as RAG, vector search, database agents, and natural-language querying.

## How To Try It

- Start on the Dashboard to see the workbench entry points.
- Open Scenarios to browse existing sample customer scenarios.
- Open Competitive SE Assist to enter a customer situation or load an existing scenario.
- Generate a field assist to create discovery guidance and battle-card style output.
- Open Debate Arena, select the same scenario, and generate a debate review.
- Open Architecture Generator, select the scenario, and generate an architecture blueprint.
- Revisit Scenarios later to find saved use cases and generated outputs.

## Current Deployment

- App host: OCI VM
- App runtime: Next.js standalone server
- AI generation: OpenAI
- Persistence: Oracle Autonomous Database
- Current public test URL: `http://147.224.221.19:3000`
