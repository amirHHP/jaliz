import { createClient } from "@libsql/client"

const client = createClient({
  url: "file:prisma/dev.db",
})

try {
  console.log("Checking if avatar column exists in User...")
  const res = await client.execute("PRAGMA table_info(User);")
  const hasColumn = res.rows.some(row => row.name === "avatar")

  if (hasColumn) {
    console.log("Column 'avatar' already exists on 'User' table.")
  } else {
    console.log("Column 'avatar' does not exist. Adding it...")
    await client.execute('ALTER TABLE "User" ADD COLUMN "avatar" TEXT;')
    console.log("Successfully added column 'avatar' to 'User' table!")
  }
} catch (e) {
  console.error("Failed to run migration:", e.message)
  process.exit(1)
} finally {
  client.close()
}
