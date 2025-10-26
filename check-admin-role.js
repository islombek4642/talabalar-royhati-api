const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminRole() {
  console.log('\n✅ Checking admin roles...\n');

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      full_name: true,
      role: true,
      is_active: true
    }
  });

  console.log(`Total Admins: ${admins.length}\n`);
  
  admins.forEach((admin, i) => {
    console.log(`[${i + 1}] ${admin.username}`);
    console.log(`    Role: ${admin.role} ${admin.role === 'SUPER_ADMIN' ? '👑' : '🔧'}`);
    console.log(`    Email: ${admin.email || 'N/A'}`);
    console.log(`    Name: ${admin.full_name || 'N/A'}`);
    console.log(`    Active: ${admin.is_active ? '✅' : '❌'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkAdminRole().catch(console.error);
