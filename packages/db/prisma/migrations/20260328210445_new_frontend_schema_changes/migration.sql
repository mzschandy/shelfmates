/*
  Warnings:

  - You are about to drop the column `profile_id` on the `annotations` table. All the data in the column will be lost.
  - You are about to drop the column `club_id` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `club_members` table. All the data in the column will be lost.
  - You are about to drop the column `club_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `club_member_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `user_session_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,club_id]` on the table `club_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `clubs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[book_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,session_id]` on the table `user_session_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `annotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `club_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `clubs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Made the column `session_id` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `club_id` on table `threads` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `user_session_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "highlightColor" AS ENUM ('YELLOW', 'RED', 'BLUE', 'GREEN');

-- DropForeignKey
ALTER TABLE "annotations" DROP CONSTRAINT "fk_profile_id";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_club_id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_session_id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_uploaded_by_club_id_fkey";

-- DropForeignKey
ALTER TABLE "club_members" DROP CONSTRAINT "club_members_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_club_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_club_member_id_club_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_book_id_fkey";

-- DropForeignKey
ALTER TABLE "user_session_progress" DROP CONSTRAINT "fk_profile_id";

-- DropIndex
DROP INDEX "club_members_profile_id_club_id_key";

-- DropIndex
DROP INDEX "user_session_progress_profile_id_session_id_key";

-- AlterTable
ALTER TABLE "annotations" DROP COLUMN "profile_id",
ADD COLUMN     "color" "highlightColor",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "books" DROP COLUMN "club_id";

-- AlterTable
ALTER TABLE "club_members" DROP COLUMN "profile_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "club_id",
DROP COLUMN "club_member_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "session_id" SET NOT NULL,
ALTER COLUMN "thread_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "threads" ALTER COLUMN "club_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_session_progress" DROP COLUMN "profile_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "club_members_user_id_club_id_key" ON "club_members"("user_id", "club_id");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "clubs_slug_idx" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_book_id_key" ON "sessions"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_progress_user_id_session_id_key" ON "user_session_progress"("user_id", "session_id");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_session_progress" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
