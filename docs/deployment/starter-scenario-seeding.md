# Starter Scenario Seeding

Date: May 19, 2026

Starter scenarios give new users an immediate catalog to explore without calling them smoke tests. They are stored in source control at `data/starter-scenarios.json` and loaded through the same app APIs used by the UI.

## What The Script Does

`npm run seed:starter-scenarios` does the following for each starter scenario:

1. Calls `/api/competitive-assist` to generate the SE Assistant output.
2. Calls `/api/use-cases` with a stable `existingId` to save or update the catalog item.
3. Prints the resulting catalog source and saved scenario IDs.

This tests OpenAI generation, app routing, and ADB persistence together.

## Local Usage

```bash
npm run seed:starter-scenarios
```

The default target is `http://localhost:3000`.

## OCI VM Usage

```bash
OAA_BASE_URL=http://147.224.221.19:3000 npm run seed:starter-scenarios
```

Or pass the base URL explicitly:

```bash
npm run seed:starter-scenarios -- --base-url=http://147.224.221.19:3000
```

## Current Starter Scenarios

- State Revenue Agency Snowflake Modernization Scenario
- Public Safety Azure Sovereign Deployment Scenario
- Health Benefits Google Cloud AI Platform Scenario

Each scenario uses a different competitor and strategy domain so the catalog demonstrates breadth across database modernization, sovereign deployment, and AI/ML platform strategy.
