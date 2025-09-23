-- CreateEnum
CREATE TYPE "annotationType" AS ENUM ('HIGHLIGHT', 'NOTE');

-- CreateTable
CREATE TABLE "user_session_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_cfi" TEXT NOT NULL,

    CONSTRAINT "user_session_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "cfi_range" TEXT NOT NULL,
    "is_public" BOOLEAN DEFAULT false,
    "note_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "type" "annotationType" NOT NULL,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_progress_profile_id_session_id_key" ON "user_session_progress"("profile_id", "session_id");

-- AddForeignKey
ALTER TABLE "user_session_progress" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_session_progress" ADD CONSTRAINT "fk_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "fk_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
