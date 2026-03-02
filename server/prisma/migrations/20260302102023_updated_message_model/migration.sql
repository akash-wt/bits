/*
  Warnings:

  - You are about to drop the `Inbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_userId_fkey";

-- DropTable
DROP TABLE "Inbox";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "senderKey" TEXT NOT NULL,
    "reciverKey" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_senderKey_reciverKey_idx" ON "Message"("senderKey", "reciverKey");

-- CreateIndex
CREATE INDEX "Message_reciverKey_status_idx" ON "Message"("reciverKey", "status");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderKey_fkey" FOREIGN KEY ("senderKey") REFERENCES "User"("pubKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reciverKey_fkey" FOREIGN KEY ("reciverKey") REFERENCES "User"("pubKey") ON DELETE RESTRICT ON UPDATE CASCADE;
