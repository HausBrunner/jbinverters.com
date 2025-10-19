/*
  Warnings:

  - The `status` column on the `orders` table is being dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateTable
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDER_RECEIVED',
    "internalNotes" TEXT,
    "trackingNumber" TEXT,
    "diagnoseNotes" TEXT,
    "repairQuote" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_orders" ("createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "diagnoseNotes", "id", "internalNotes", "isArchived", "orderNumber", "repairQuote", "status", "total", "trackingNumber", "updatedAt") SELECT "createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "diagnoseNotes", "id", "internalNotes", "isArchived", "orderNumber", "repairQuote", CASE WHEN "status" IN ('SHIPPED', 'COMPLETED') THEN 'SHIPPED_AND_COMPLETE' ELSE "status" END, "total", "trackingNumber", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;