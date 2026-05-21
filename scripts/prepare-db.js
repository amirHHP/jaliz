const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';

// Determine target provider
let targetProvider = 'sqlite';
if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  targetProvider = 'postgresql';
}

console.log(`[prepare-db] Checking Prisma database provider. Target: ${targetProvider}`);

// Replace provider = "sqlite" or provider = "postgresql" with the target provider
const updatedContent = schemaContent.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/g,
  `provider = "${targetProvider}"`
);

if (updatedContent !== schemaContent) {
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
  console.log(`[prepare-db] Prisma schema successfully updated to use: provider = "${targetProvider}"`);
} else {
  console.log(`[prepare-db] Prisma schema is already configured for provider: "${targetProvider}"`);
}

// Generate the client
const execUrl = dbUrl || 'file:./dev.db';
console.log(`[prepare-db] Running 'npx prisma generate' with DATABASE_URL...`);
try {
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: execUrl,
    },
  });
  console.log('[prepare-db] Prisma Client generation complete.');
} catch (error) {
  console.error('[prepare-db] Error during prisma generate:', error.message);
  process.exit(1);
}
