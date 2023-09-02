/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Example";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "query" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL
);
