const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicateEmails() {
  console.log('\n🔍 Checking for duplicate emails across tables...\n');

  const admins = await prisma.admin.findMany({
    where: { email: { not: null } },
    select: { email: true, username: true, full_name: true }
  });

  const students = await prisma.student.findMany({
    where: { email: { not: null } },
    select: { email: true, full_name: true, faculty: true, group: true }
  });

  const users = await prisma.user.findMany({
    select: { email: true, role: true, student_id: true }
  });

  console.log('========== ADMIN EMAILS ==========');
  admins.forEach(admin => {
    console.log(`- ${admin.email} (${admin.username} - ${admin.full_name})`);
  });

  console.log('\n========== STUDENT EMAILS ==========');
  students.forEach(student => {
    console.log(`- ${student.email} (${student.full_name} - ${student.faculty})`);
  });

  console.log('\n========== USER EMAILS ==========');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });

  // Check for duplicates
  console.log('\n========== DUPLICATE CHECK ==========');
  const allEmails = [
    ...admins.map(a => ({ email: a.email, type: 'Admin', name: a.username })),
    ...students.map(s => ({ email: s.email, type: 'Student', name: s.full_name })),
    ...users.map(u => ({ email: u.email, type: 'User', name: u.role }))
  ];

  const emailCounts = {};
  allEmails.forEach(item => {
    if (!emailCounts[item.email]) {
      emailCounts[item.email] = [];
    }
    emailCounts[item.email].push(`${item.type} (${item.name})`);
  });

  let hasDuplicates = false;
  Object.entries(emailCounts).forEach(([email, types]) => {
    if (types.length > 1) {
      hasDuplicates = true;
      console.log(`\n⚠️  DUPLICATE FOUND: ${email}`);
      console.log(`   Used by: ${types.join(', ')}`);
    }
  });

  if (!hasDuplicates) {
    console.log('✅ No duplicate emails found');
  }

  await prisma.$disconnect();
}

checkDuplicateEmails().catch(console.error);
