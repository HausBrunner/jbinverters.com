-- CreateTable
CREATE TABLE "serial_numbers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "serial_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "serial_numbers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "internalNotes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_orders" ("createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "id", "orderNumber", "status", "total", "updatedAt") SELECT "createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "id", "orderNumber", "status", "total", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "serial_numbers_serialNumber_key" ON "serial_numbers"("serialNumber");
