-- Clear all student data from database

-- Delete all users (students)
DELETE FROM "User" WHERE role = 'STUDENT';

-- Delete all students
DELETE FROM "Student";

-- Reset sequences (optional)
-- ALTER SEQUENCE "Student_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "User_id_seq" RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as student_count FROM "Student";
SELECT COUNT(*) as user_count FROM "User" WHERE role = 'STUDENT';
