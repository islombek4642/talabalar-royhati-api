-- Create AdminRole enum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- Add role column to Admin table with default value
ALTER TABLE "Admin" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- Update existing admin to SUPER_ADMIN
UPDATE "Admin" SET "role" = 'SUPER_ADMIN' WHERE username = 'admin';

-- Create index on role
CREATE INDEX "Admin_role_idx" ON "Admin"("role");
