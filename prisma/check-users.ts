import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n========== ADMIN USERS ==========');
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        is_active: true,
        last_login_at: true,
        created_at: true
      }
    });
    console.log(`Total Admins: ${admins.length}`);
    admins.forEach((admin, i) => {
      console.log(`\n[${i + 1}] Admin:`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Email: ${admin.email || 'NOT SET'}`);
      console.log(`  Full Name: ${admin.full_name || 'NOT SET'}`);
      console.log(`  Phone: ${admin.phone || 'NOT SET'}`);
      console.log(`  Active: ${admin.is_active}`);
      console.log(`  Last Login: ${admin.last_login_at || 'NEVER'}`);
    });

    console.log('\n========== STUDENT USERS ==========');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        student_id: true,
        email: true,
        role: true,
        is_active: true,
        email_verified: true,
        last_login_at: true
      }
    });
    console.log(`Total Users: ${users.length}`);
    
    console.log('\n========== STUDENTS (First 3) ==========');
    const students = await prisma.student.findMany({
      take: 3,
      select: {
        id: true,
        full_name: true,
        faculty: true,
        group: true,
        email: true,
        status: true,
        deleted_at: true
      }
    });
    console.log(`Total Students in DB: ${await prisma.student.count()}`);
    students.forEach((student, i) => {
      console.log(`\n[${i + 1}] Student:`);
      console.log(`  Name: ${student.full_name}`);
      console.log(`  Faculty: ${student.faculty}`);
      console.log(`  Group: ${student.group}`);
      console.log(`  Email: ${student.email || 'NOT SET'}`);
      console.log(`  Status: ${student.status}`);
      console.log(`  Deleted: ${student.deleted_at ? 'YES' : 'NO'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
