const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEmailLookup() {
  const searchEmail = "ihamidullayev5@gmail.com";
  
  console.log(`\n🔍 Searching for: ${searchEmail}\n`);

  // Scenario: Password reset - qaysi accountni reset qilish?
  console.log('========== PASSWORD RESET SCENARIO ==========');
  
  const admin = await prisma.admin.findUnique({
    where: { email: searchEmail },
    select: { id: true, username: true, email: true }
  });

  const user = await prisma.user.findUnique({
    where: { email: searchEmail },
    select: { id: true, email: true, role: true }
  });

  console.log('\nFound accounts:');
  if (admin) {
    console.log(`1. Admin Account`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ??? (admin password)`);
  }

  if (user) {
    console.log(`\n2. User Account`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ??? (student password)`);
  }

  console.log('\n❓ MUAMMO: User "Forgot Password" bosdi.');
  console.log('   Qaysi passwordni reset qilish kerak?');
  console.log('   - Admin password?');
  console.log('   - Student password?');
  console.log('   - Ikkisini ham?');
  
  console.log('\n========== EMAIL UNIQUENESS ==========');
  console.log('✅ Har bir ID unique: Admin ID !== User ID');
  console.log('⚠️  Email duplicate: Admin email === User email');
  console.log('❌ Email orqali izlashda confusion!');

  await prisma.$disconnect();
}

testEmailLookup().catch(console.error);
