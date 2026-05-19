#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const DEFAULT_BASE_URL = "http://localhost:3000"
const scenarioFilePath = path.join(process.cwd(), "data", "starter-scenarios.json")

const baseUrl = getBaseUrl()

async function main() {
  const scenarios = JSON.parse(await fs.readFile(scenarioFilePath, "utf8"))
  const seeded = []

  for (const scenario of scenarios) {
    console.log(`Generating starter scenario: ${scenario.label}`)
    const generated = await postJson("/api/competitive-assist", scenario.input)
    const saved = await postJson("/api/use-cases", {
      existingId: scenario.id,
      input: scenario.input,
      result: generated,
    })

    seeded.push({
      id: saved.item.id,
      title: saved.item.title,
      source: saved.source,
      mode: saved.item.generation.mode,
      model: saved.item.generation.model,
    })
  }

  const catalog = await getJson("/api/use-cases?limit=100")

  console.log(
    JSON.stringify(
      {
        baseUrl,
        seededCount: seeded.length,
        catalogSource: catalog.source,
        catalogCount: catalog.items?.length ?? 0,
        seeded,
      },
      null,
      2
    )
  )
}

function getBaseUrl() {
  const argBaseUrl = process.argv.find((arg) => arg.startsWith("--base-url="))
  const value = argBaseUrl?.slice("--base-url=".length) || process.env.OAA_BASE_URL

  return (value || DEFAULT_BASE_URL).replace(/\/$/, "")
}

async function getJson(route) {
  const response = await fetch(`${baseUrl}${route}`)
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(`${route} failed with ${response.status}: ${JSON.stringify(payload)}`)
  }

  return payload
}

async function postJson(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(`${route} failed with ${response.status}: ${JSON.stringify(payload)}`)
  }

  return payload
}

async function readJsonResponse(response) {
  const text = await response.text()

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
