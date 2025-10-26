import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToSuperAdmin() {
  console.log('🔧 Updating existing admin to SUPER_ADMIN...\n');

  const admin = await prisma.admin.update({
    where: { username: 'admin' },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log('✅ Admin updated successfully!');
  console.log(`   Username: ${admin.username}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Email: ${admin.email}`);

  await prisma.$disconnect();
}

updateToSuperAdmin().catch(console.error);
