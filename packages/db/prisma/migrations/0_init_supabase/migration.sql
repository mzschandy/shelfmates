-- CreateEnum
CREATE TYPE "threadtype" AS ENUM ('GENERAL', 'SESSION');

-- CreateTable
CREATE TABLE "books" (
    "title" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "book_cover_url" TEXT,
    "file_path" TEXT,
    "rating" REAL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "club_id" UUID NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_members" (
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "creator_id" UUID NOT NULL,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "thread_id" UUID[],

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_member_id" UUID NOT NULL,
    "session_id" UUID,
    "thread_id" UUID NOT NULL,
    "parent_id" UUID,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "club_id" UUID NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "username" TEXT,
    "avatar_url" TEXT,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID,
    "club_id" UUID NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "is_locked" BOOLEAN DEFAULT false,
    "club_id" UUID,
    "session_id" UUID,
    "type" "threadtype" NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "club_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_creator_id_fkey1" FOREIGN KEY ("creator_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_club_member_id_fkey" FOREIGN KEY ("club_member_id") REFERENCES "club_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "fk_thread_id" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "fk_club_id" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "fk_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

