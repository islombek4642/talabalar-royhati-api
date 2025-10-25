-- Fix missing enrollment_year and created_at for existing students

-- Update all students without enrollment_year
UPDATE "Student"
SET 
  enrollment_year = 2021,
  created_at = COALESCE(created_at, updated_at, NOW())
WHERE enrollment_year IS NULL OR created_at IS NULL;

-- Verify the update
SELECT id, full_name, enrollment_year, created_at, updated_at
FROM "Student"
LIMIT 10;
