/*
  Warnings:

  - A unique constraint covering the columns `[userId,nonce]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nonce` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "nonce" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_nonce_key" ON "Session"("userId", "nonce");
