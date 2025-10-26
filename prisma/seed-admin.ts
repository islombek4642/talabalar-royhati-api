import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Seeding admin user...');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const email = process.env.ADMIN_EMAIL || 'admin@talabalar.uz';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { username }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin with SUPER_ADMIN role
  const admin = await prisma.admin.create({
    data: {
      username,
      email,
      password: hashedPassword,
      full_name: 'System Administrator',
      role: 'SUPER_ADMIN', // First admin is always super admin
      is_active: true
    }
  });

  console.log('✅ Super Admin user created successfully!');
  console.log(`   Username: ${admin.username}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: SUPER_ADMIN 👑`);
  console.log(`   Password: ${password} (change this after first login!)`);
}

seedAdmin()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding admin:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
