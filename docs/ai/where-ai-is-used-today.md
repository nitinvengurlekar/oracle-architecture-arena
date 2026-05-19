# Where AI Is Used Today

Date: May 19, 2026

## Competitive SE Assist

Uses OpenAI to turn incomplete customer context into structured sales engineering guidance:

- inferred priorities
- discovery questions
- Oracle positioning
- competitor strengths and risks
- recommended talk track
- battle-card output

Route: `/api/competitive-assist`

## Debate Arena

Uses OpenAI to generate:

- Oracle Architect Agent response
- Competitor Architect Agent response
- Neutral CTO Judge response
- scoring system
- architecture recommendation summary

Route: `/api/debate-arena`

## RAG Context Today

The app has a RAG-like context layer, but it is currently static and local. Retrieved context comes from `src/data/rag-corpus.ts`, not yet from ADB vector search.

## Architecture Generator

Not fully AI-driven yet. It uses saved recommendations and seeded/generated architecture content to render ReactFlow diagrams. This is the next logical AI integration point.

## Whiteboard Studio

No AI yet. It has the future hook for sketch-to-architecture generation.
