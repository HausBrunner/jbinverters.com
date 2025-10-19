/*
  Warnings:

  - You are about to drop the column `diagnoseNotes` on the `orders` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "status" TEXT NOT NULL DEFAULT 'ORDER_RECEIVED',
    "internalNotes" TEXT,
    "trackingNumber" TEXT,
    "repairQuote" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_orders" ("createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "id", "internalNotes", "isArchived", "orderNumber", "repairQuote", "status", "total", "trackingNumber", "updatedAt") SELECT "createdAt", "customerAddress", "customerEmail", "customerName", "customerPhone", "id", "internalNotes", "isArchived", "orderNumber", "repairQuote", "status", "total", "trackingNumber", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
