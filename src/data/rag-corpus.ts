import type { RagDocument } from "@/types/workbench"

export const ragDocuments = [
  {
    id: "oci-goldengate-oracle-gravity",
    title: "Oracle data gravity and GoldenGate integration",
    sourceType: "oracle-capability",
    domain: "lakehouse-modernization",
    competitor: "Databricks",
    keywords: [
      "lakehouse",
      "databricks",
      "goldengate",
      "oracle data",
      "replication",
      "freshness",
    ],
    excerpt:
      "When Oracle remains the system of record, position Oracle GoldenGate and OCI data services around low-latency movement, governed replication, and reduced data duplication before the customer standardizes on a separate lakehouse control plane.",
  },
  {
    id: "autonomous-database-modernization",
    title: "Autonomous Database modernization path",
    sourceType: "oracle-capability",
    domain: "database-modernization",
    keywords: [
      "autonomous database",
      "database modernization",
      "migration",
      "availability",
      "exadata",
      "data guard",
    ],
    excerpt:
      "For Oracle estate modernization, separate infrastructure modernization from application rewrites. Anchor the path on Autonomous Database, Exadata, RAC, Data Guard, and migration tooling when workload behavior and availability matter.",
  },
  {
    id: "oci-ai-governed-platform",
    title: "Governed AI platform on OCI",
    sourceType: "architecture-pattern",
    domain: "ai-ml-platform",
    keywords: [
      "ai platform",
      "genai",
      "model governance",
      "vector search",
      "oci data science",
      "regulated",
    ],
    excerpt:
      "A governed OCI AI platform should connect model workflows to trusted enterprise data, vector search, auditability, and cost controls. Distinguish experimentation from production AI before selecting GPU and inference patterns.",
  },
  {
    id: "sovereign-oci-deployment-options",
    title: "Sovereign deployment options",
    sourceType: "governance-pattern",
    domain: "sovereign-deployment",
    keywords: [
      "sovereign",
      "government",
      "dedicated region",
      "oracle alloy",
      "residency",
      "operator control",
    ],
    excerpt:
      "Sovereign architecture decisions should surface residency, operator access, accreditation, audit evidence, and deployment autonomy. OCI Dedicated Region, Oracle Alloy, sovereign regions, and isolated patterns may fit different control models.",
  },
  {
    id: "databricks-strengths-risks",
    title: "Databricks lakehouse strengths and risks",
    sourceType: "competitive-context",
    domain: "lakehouse-modernization",
    competitor: "Databricks",
    keywords: [
      "databricks",
      "lakehouse",
      "notebooks",
      "data science",
      "cost predictability",
      "governance",
    ],
    excerpt:
      "Acknowledge Databricks' data engineering, data science, and collaborative notebook strengths. Test production governance, cost predictability, Oracle system-of-record integration, and residency controls as the evaluation moves beyond pilots.",
  },
  {
    id: "snowflake-analytics-strengths-risks",
    title: "Snowflake analytics strengths and risks",
    sourceType: "competitive-context",
    domain: "lakehouse-modernization",
    competitor: "Snowflake",
    keywords: [
      "snowflake",
      "warehouse",
      "analytics",
      "system of record",
      "egress",
      "duplication",
    ],
    excerpt:
      "Respect Snowflake's analytics simplicity and executive recognition. If Oracle remains the operational source, qualify data duplication, egress, AI adjacency, and whether operational modernization is part of the real scope.",
  },
  {
    id: "hyperscaler-database-modernization",
    title: "Hyperscaler managed database comparison",
    sourceType: "competitive-context",
    domain: "database-modernization",
    competitor: "AWS",
    keywords: [
      "aws",
      "azure",
      "google cloud",
      "managed database",
      "oracle workload",
      "modernization risk",
    ],
    excerpt:
      "Hyperscaler breadth can be compelling, but Oracle workload modernization should be compared on workload behavior, licensing posture, migration risk, performance, and operational ownership rather than generic service catalog coverage.",
  },
  {
    id: "architecture-handoff-pattern",
    title: "Field assist to architecture handoff",
    sourceType: "architecture-pattern",
    domain: "cross-domain",
    keywords: [
      "debate arena",
      "architecture generator",
      "handoff",
      "assumptions",
      "recommendation",
      "blueprint",
    ],
    excerpt:
      "Competitive SE Assist should leave explicit assumptions, one recommended next discovery move, and architecture handoff inputs so Debate Arena can test tradeoffs and Architecture Generator can draft the first blueprint.",
  },
] satisfies RagDocument[]
