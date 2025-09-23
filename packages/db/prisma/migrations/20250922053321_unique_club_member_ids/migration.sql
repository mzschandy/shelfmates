/*
  Warnings:

  - A unique constraint covering the columns `[profile_id,club_id]` on the table `club_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "club_members_profile_id_club_id_key" ON "club_members"("profile_id", "club_id");
