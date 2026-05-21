#!/usr/bin/env node
/**
 * Push Prisma schema directly to a remote Turso database.
 * 
 * Usage:
 *   DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/push-turso.mjs
 */

import { execSync } from "node:child_process"
import { createClient } from "@libsql/client"

const dbUrl = (process.env.DATABASE_URL || "").trim()
const token = (process.env.TURSO_AUTH_TOKEN || "").trim()

if (!dbUrl || !token) {
  console.error("Error: DATABASE_URL and TURSO_AUTH_TOKEN environment variables must be set.")
  process.exit(1)
}

if (!dbUrl.startsWith("libsql://") && !dbUrl.startsWith("https://")) {
  console.error("Error: DATABASE_URL must start with libsql:// or https://")
  process.exit(1)
}

console.log("Generating schema SQL using Prisma...")
let sql
try {
  sql = execSync("npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script", { 
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URL: "file:./dev.db" // dummy URL so Prisma CLI validates the schema
    }
  })
} catch (e) {
  console.error("Failed to generate SQL schema:", e.message)
  process.exit(1)
}

console.log("Connecting to Turso database...")
const client = createClient({
  url: dbUrl,
  authToken: token,
})

console.log("Executing SQL schema on Turso...")
// Remove SQL comments before splitting by semicolon
const cleanSql = sql
  .split("\n")
  .filter(line => !line.trim().startsWith("--"))
  .join("\n")

// Split SQL statements by semicolon and filter empty lines
const statements = cleanSql
  .split(";")
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)

try {
  // Execute all SQL statements in a batch transaction
  await client.batch(statements, "write")
  console.log("Successfully pushed schema to Turso!")
} catch (e) {
  console.error("Failed to execute SQL on Turso:", e.message)
  process.exit(1)
} finally {
  client.close()
}
