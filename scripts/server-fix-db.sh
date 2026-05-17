#!/bin/sh
# Run on the production host from the jaliz repo directory:
#   sudo sh scripts/server-fix-db.sh
set -e

cd "$(dirname "$0")/.."

echo "1) Rebuild web image (no cache)..."
docker compose build --no-cache web

echo "2) Recreate web container..."
docker compose up -d --force-recreate web

echo "3) Wait for startup..."
sleep 5

echo "4) Entrypoint + DB path:"
docker compose logs web --tail=20

echo ""
echo "5) In-container checks:"
docker compose exec -u root web sh -c '
  echo "Entrypoint: $(head -1 /entrypoint.sh 2>/dev/null || echo MISSING)"
  echo "DATABASE_URL=$DATABASE_URL"
  ls -la /app/data 2>/dev/null || echo "/app/data missing"
  ls -la /app/prisma/dev.db 2>/dev/null || echo "no /app/prisma/dev.db (expected)"
'

echo ""
echo "Done. Create a user with a brand-new email in /admin."
