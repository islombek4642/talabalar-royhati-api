const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
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
  console.log(JSON.stringify(admins, null, 2));

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
  console.log(JSON.stringify(users, null, 2));

  console.log('\n========== STUDENTS ==========');
  const students = await prisma.student.findMany({
    take: 5,
    select: {
      id: true,
      full_name: true,
      faculty: true,
      group: true,
      email: true,
      status: true
    }
  });
  console.log(`Total Students (showing first 5): ${students.length}`);
  console.log(JSON.stringify(students, null, 2));

  await prisma.$disconnect();
}

checkDatabase().catch(console.error);
