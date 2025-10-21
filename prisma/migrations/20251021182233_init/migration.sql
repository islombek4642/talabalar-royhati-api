-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'graduated', 'expelled', 'academic_leave');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "enrollment_year" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
