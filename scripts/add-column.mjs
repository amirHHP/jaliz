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
  console.log("Checking if lastSoilChange column exists in UserPlant...")
  const res = await client.execute("PRAGMA table_info(UserPlant);")
  const hasColumn = res.rows.some(row => row.name === "lastSoilChange")

  if (hasColumn) {
    console.log("Column 'lastSoilChange' already exists on 'UserPlant' table.")
  } else {
    console.log("Column 'lastSoilChange' does not exist. Adding it...")
    await client.execute('ALTER TABLE "UserPlant" ADD COLUMN "lastSoilChange" DATETIME;')
    console.log("Successfully added column 'lastSoilChange' to 'UserPlant' table!")
  }
} catch (e) {
  console.error("Failed to run migration:", e.message)
  process.exit(1)
} finally {
  client.close()
}
