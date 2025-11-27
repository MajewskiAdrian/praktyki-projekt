/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "channelId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_channelId_key" ON "Event"("channelId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
