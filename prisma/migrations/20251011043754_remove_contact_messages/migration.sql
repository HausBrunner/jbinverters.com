/*
  Warnings:

  - You are about to drop the `contact_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "contact_messages";
PRAGMA foreign_keys=on;
