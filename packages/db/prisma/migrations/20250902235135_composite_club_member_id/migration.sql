/*
  Warnings:

  - The primary key for the `club_members` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_club_member_id_fkey";

-- AlterTable
ALTER TABLE "club_members" DROP CONSTRAINT "club_members_pkey",
ADD CONSTRAINT "club_members_pkey" PRIMARY KEY ("id", "club_id");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_by_club_id_fkey" FOREIGN KEY ("uploaded_by", "club_id") REFERENCES "club_members"("id", "club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_club_member_id_club_id_fkey" FOREIGN KEY ("club_member_id", "club_id") REFERENCES "club_members"("id", "club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
