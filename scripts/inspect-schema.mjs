import { createClient } from "@libsql/client"

const dbUrl = (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "").trim()
const token = (process.env.TURSO_AUTH_TOKEN || "").trim()

if (!dbUrl || !token) {
  console.error("Error: DATABASE_URL and TURSO_AUTH_TOKEN must be set.")
  process.exit(1)
}

const client = createClient({
  url: dbUrl,
  authToken: token,
})

try {
  console.log("Fetching table schemas from Turso...")
  const res = await client.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
  for (const row of res.rows) {
    console.log(`Table: ${row.name}`)
    console.log(row.sql)
    console.log("-----------------------------------------")
  }
} catch (e) {
  console.error("Error:", e.message)
} finally {
  client.close()
}
