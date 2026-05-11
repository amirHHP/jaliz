const { PrismaClient } = require('@prisma/client');
try {
  const prisma = new PrismaClient({ url: "file:./prisma/dev.db" });
  console.log("Success with url");
} catch (e) {
  console.error("Failed with url", e.message);
}

try {
  const prisma2 = new PrismaClient({ datasources: { db: { url: "file:./prisma/dev.db" } } });
  console.log("Success with datasources");
} catch (e) {
  console.error("Failed with datasources", e.message);
}
