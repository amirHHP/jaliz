const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in database:", users.map(u => ({ id: u.id, email: u.email })));
    const plants = await prisma.userPlant.findMany();
    console.log("Total plants in database:", plants.length);
    console.log("Plants data:", JSON.stringify(plants, null, 2));
  } catch (err) {
    console.error("Error reading database:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
