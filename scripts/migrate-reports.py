import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'prisma', 'dev.db')
print(f"Connecting to database at {db_path}...")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if table already exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='MarketplaceReport';")
table_exists = cursor.fetchone()

if not table_exists:
    print("Creating MarketplaceReport table...")
    create_table_sql = """
    CREATE TABLE "MarketplaceReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "listingId" TEXT NOT NULL,
        "reporterId" TEXT,
        "reason" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MarketplaceReport_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "MarketplaceReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
    """
    cursor.execute(create_table_sql)
    conn.commit()
    print("MarketplaceReport table created successfully!")
else:
    print("MarketplaceReport table already exists.")

# Check tables in database
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database:", [t[0] for t in tables])

conn.close()
