-- AlterTable: Add soft delete and audit fields to Student
ALTER TABLE "Student" ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "created_by" TEXT,
ADD COLUMN "updated_by" TEXT;

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entity_type_entity_id_idx" ON "AuditLog"("entity_type", "entity_id");
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex for better query performance
CREATE INDEX "Student_deleted_at_idx" ON "Student"("deleted_at");
CREATE INDEX "Student_created_by_idx" ON "Student"("created_by");
CREATE INDEX "Student_faculty_status_idx" ON "Student"("faculty", "status") WHERE "deleted_at" IS NULL;
