/*
  Warnings:

  - Added the required column `receiver` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_reciverKey_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "receiver" TEXT NOT NULL;
