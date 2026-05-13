import { checkOracleDatabaseHealth } from "@/lib/db/oracle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET() {
  const health = await checkOracleDatabaseHealth()
  const statusCode =
    health.status === "ok" ? 200 : health.status === "not_configured" ? 503 : 500

  return Response.json(health, { status: statusCode })
}
