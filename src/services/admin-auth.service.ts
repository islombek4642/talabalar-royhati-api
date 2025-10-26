import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

export const adminAuthService = {
  async login(username: string, password: string) {
    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    if (!admin.is_active) {
      throw new Error('Admin account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { last_login_at: new Date() }
    });

    // Generate token
    const token = jwt.sign(
      {
        sub: admin.id,
        username: admin.username,
        role: 'admin'
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      access_token: token,
      token_type: 'Bearer',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name
      }
    };
  },

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  },

  async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,  // ← QOSHILDI!
        is_active: true,
        last_login_at: true,
        created_at: true
      }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  },

  async updateProfile(adminId: string, data: { full_name?: string; email?: string; phone?: string }) {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Check if email is being changed and if it's already in use
    if (data.email && data.email !== admin.email) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: data.email }
      });

      if (existingAdmin) {
        throw new Error('Email already in use');
      }
    }

    // Update admin profile
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone
      },
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

    return updatedAdmin;
  }
};
