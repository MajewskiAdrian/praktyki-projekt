/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventAttendees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventAttendees" DROP CONSTRAINT "_EventAttendees_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventAttendees" DROP CONSTRAINT "_EventAttendees_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventTags" DROP CONSTRAINT "_EventTags_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventTags" DROP CONSTRAINT "_EventTags_B_fkey";

-- DropIndex
DROP INDEX "public"."Event_eventDate_idx";

-- DropIndex
DROP INDEX "public"."Event_latitude_longitude_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "createdAt",
DROP COLUMN "creatorId",
ALTER COLUMN "title" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."_EventAttendees";

-- DropTable
DROP TABLE "public"."_EventTags";

-- CreateTable
CREATE TABLE "EventTag" (
    "eventId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("eventId","tagId")
);

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
