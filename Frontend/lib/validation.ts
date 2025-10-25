import { z } from 'zod';

// Phone number validation for Uzbekistan
export const uzbekPhoneRegex = /^\+998[0-9]{9}$/;

export const phoneValidation = z
  .string()
  .optional()
  .refine(
    (val) => !val || uzbekPhoneRegex.test(val),
    'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'
  );

// Birth date validation (must be between 16 and 100 years old)
export const birthDateValidation = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD')
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 100;
  }, 'Yosh 16 dan 100 gacha bo\'lishi kerak');

// Enrollment year validation
export const enrollmentYearValidation = z
  .number()
  .int()
  .min(2000, 'Yil 2000 dan kichik bo\'lmasligi kerak')
  .max(new Date().getFullYear(), 'Kelajak yilini kiritib bo\'lmaydi');

// Email validation with better error message
export const emailValidation = z
  .string()
  .email('Noto\'g\'ri email format (example@domain.com)');

// Password validation with strength requirements
export const passwordValidation = z
  .string()
  .min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak')
  .max(128, 'Parol 128 belgidan oshmasligi kerak');

// Strong password validation
export const strongPasswordValidation = z
  .string()
  .min(8, 'Parol kamida 8 ta belgi bo\'lishi kerak')
  .regex(/[a-z]/, 'Kamida bitta kichik harf kerak')
  .regex(/[A-Z]/, 'Kamida bitta katta harf kerak')
  .regex(/[0-9]/, 'Kamida bitta raqam kerak')
  .regex(/[^a-zA-Z0-9]/, 'Kamida bitta maxsus belgi kerak');
