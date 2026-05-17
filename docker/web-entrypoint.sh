#!/bin/sh
set -e

echo "=== Jaliz web entrypoint ==="
echo "DATABASE_URL=${DATABASE_URL:-<unset>}"

mkdir -p /app/data

# One-time migration from legacy bind-mounted ./prisma/dev.db on the host.
if [ -f /migration/prisma/dev.db ]; then
  if [ ! -f /app/data/dev.db ] || [ ! -s /app/data/dev.db ]; then
    echo "Migrating SQLite database from /migration/prisma/dev.db -> /app/data/dev.db"
    cp /migration/prisma/dev.db /app/data/dev.db
  fi
else
  echo "No legacy DB at /migration/prisma/dev.db (ok on repeat deploys)"
fi

chown -R nextjs:nodejs /app/data
chmod -R u+rwX /app/data
if [ -f /app/data/dev.db ]; then
  chown nextjs:nodejs /app/data/dev.db
  chmod 664 /app/data/dev.db
fi

echo "Data directory permissions:"
ls -la /app/data

cd /app
su-exec nextjs npx prisma db push --accept-data-loss
echo "=== Starting Next.js ==="
exec su-exec nextjs "$@"
