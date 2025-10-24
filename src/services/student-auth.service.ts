import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  faculty: string;
  group: string;
  birth_date: string;
  enrollment_year: number;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const studentAuthService = {
  async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create student and user in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create student
      const student = await tx.student.create({
        data: {
          full_name: data.full_name,
          email: data.email,
          faculty: data.faculty,
          group: data.group,
          birth_date: new Date(data.birth_date),
          enrollment_year: data.enrollment_year,
          phone: data.phone,
          status: 'active',
        }
      });

      // Create user account
      const user = await tx.user.create({
        data: {
          student_id: student.id,
          email: data.email,
          password: hashedPassword,
          role: 'STUDENT',
          is_active: true,
        }
      });

      return { student, user };
    });

    // Generate JWT token
    const token = this.generateToken(result.user.id, result.student.id, 'STUDENT');

    // Return student data (without password)
    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      student: {
        id: result.student.id,
        full_name: result.student.full_name,
        email: result.student.email,
        faculty: result.student.faculty,
        group: result.student.group,
        profile_picture: result.student.profile_picture,
      }
    };
  },

  async login(data: LoginData) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        student: true
      }
    });

    if (!user || !user.is_active) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.student_id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      student: {
        id: user.student.id,
        full_name: user.student.full_name,
        email: user.student.email,
        faculty: user.student.faculty,
        group: user.student.group,
        profile_picture: user.student.profile_picture,
        status: user.student.status,
      }
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.student.id,
      full_name: user.student.full_name,
      email: user.student.email,
      phone: user.student.phone,
      faculty: user.student.faculty,
      group: user.student.group,
      birth_date: user.student.birth_date,
      enrollment_year: user.student.enrollment_year,
      status: user.student.status,
      profile_picture: user.student.profile_picture,
      created_at: user.student.created_at,
      updated_at: user.student.updated_at,
    };
  },

  async updateProfile(userId: string, data: Partial<RegisterData>) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update student data
    const updated = await prisma.student.update({
      where: { id: user.student_id },
      data: {
        full_name: data.full_name,
        phone: data.phone,
        faculty: data.faculty,
        group: data.group,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
        updated_by: user.id,
      }
    });

    return updated;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  },

  generateToken(userId: string, studentId: string, role: string): string {
    return jwt.sign(
      { 
        sub: userId, 
        student_id: studentId,
        role: role 
      },
      env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, env.JWT_SECRET) as {
        sub: string;
        student_id: string;
        role: string;
      };
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
};
