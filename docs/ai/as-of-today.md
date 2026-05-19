# As of Today: AI Capability Snapshot

Date: May 19, 2026

Oracle Architecture Arena is already AI-enabled, with live OpenAI-backed generation and Oracle Autonomous Database persistence on the OCI VM. The next major step is to make Oracle AI Database 26ai the retrieval, search, and natural-language reasoning backbone instead of using ADB only for storage.

## Where AI Is Used Today

- **Competitive SE Assist**
  Uses OpenAI to turn incomplete customer context into structured sales engineering guidance: inferred priorities, discovery questions, Oracle positioning, competitor strengths and risks, talk track, and battle-card output.

  Route: `/api/competitive-assist`

- **Debate Arena**
  Uses OpenAI to generate the Oracle Architect Agent, Competitor Architect Agent, Neutral CTO Judge, scoring, and architecture recommendation.

  Route: `/api/debate-arena`

- **RAG Context Today**
  The app has a RAG-like layer, but it is currently static and local. Retrieved context comes from `src/data/rag-corpus.ts`, not yet from ADB vector search.

- **Architecture Generator**
  Not fully AI-driven yet. It uses saved recommendations and seeded/generated architecture content to render ReactFlow diagrams. This is the next logical AI integration point.

- **Whiteboard Studio**
  No AI yet. It has the future hook for sketch-to-architecture generation.

## What ADB 26ai Unlocks

1. **Real RAG**
   Store Oracle docs, competitive notes, architecture patterns, and generated outputs in ADB; chunk documents; create embeddings; store vectors in `oaa_knowledge_chunks`; retrieve relevant chunks during SE Assist, Debate Arena, and Architecture Generator generation.

2. **NLQ / Ask the Catalog**
   Let users ask natural-language questions such as “Show all Snowflake scenarios involving regulated data” or “Which use cases mention sovereign deployment and Exadata?” over safe database views.

3. **Database Agent Path**
   Once the data model is stable, use ADB 26ai agent capabilities for governed workflows such as comparing scenarios, finding missing discovery, and generating executive briefs from the catalog.

## Best Next AI Roadmap

1. Add ADB-backed RAG for Competitive SE Assist.
2. Show RAG citations in the UI.
3. Make Architecture Generator AI-driven from selected scenarios, Debate Arena recommendations, and retrieved context.
4. Add an “Ask the Arena” natural-language query panel over scenarios, assists, debates, and architecture drafts.
5. Introduce database-agent workflows after the schema and use-case catalog stabilize.
