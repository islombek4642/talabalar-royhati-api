'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Eye, EyeOff, GraduationCap, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Ism kamida 2 ta harf bo\'lishi kerak'),
  email: z.string().email('Noto\'g\'ri email format'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
  confirmPassword: z.string(),
  faculty: z.string().min(2, 'Fakultet kiriting'),
  group: z.string().min(1, 'Guruh kiriting'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  enrollment_year: z.number().min(2000).max(new Date().getFullYear()),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmayapti",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, isAuthenticated, isInitialized, loadFromStorage } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load auth state on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Redirect if already logged in (but only after initialization)
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      enrollment_year: new Date().getFullYear(),
    },
  });

  const getErrorMessage = (error: any): string => {
    const errorMessage = error.response?.data?.error?.message || '';
    
    // Translate common errors to Uzbek
    if (errorMessage.includes('Email already registered') || errorMessage.includes('email')) {
      return 'Bu email allaqachon ro\'yhatdan o\'tgan. Boshqa email kiriting yoki login qiling.';
    }
    if (errorMessage.includes('Unique constraint') && errorMessage.includes('email')) {
      return 'Bu email allaqachon ro\'yhatdan o\'tgan. Boshqa email kiriting yoki login qiling.';
    }
    if (errorMessage.includes('validation')) {
      return 'Ma\'lumotlar noto\'g\'ri kiritilgan. Iltimos, qaytadan tekshiring.';
    }
    if (errorMessage.includes('network') || error.code === 'ERR_NETWORK') {
      return 'Internet aloqasi yo\'q. Iltimos, internetni tekshiring.';
    }
    
    return errorMessage || 'Ro\'yhatdan o\'tishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Back to Home Button */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifa
          </Link>
          <GraduationCap className="w-8 h-8 text-indigo-600" />
        </div>

        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Ro'yhatdan O'tish
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Talabalar portali
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {(serverError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
              {serverError || error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                To'liq Ism
              </label>
              <input
                {...register('full_name')}
                id="full_name"
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ali Valiyev"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ali@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Parolni Tasdiqlang
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                  Fakultet
                </label>
                <input
                  {...register('faculty')}
                  id="faculty"
                  type="text"
                  autoComplete="organization"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="IT"
                />
                {errors.faculty && (
                  <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <input
                  {...register('group')}
                  id="group"
                  type="text"
                  autoComplete="off"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="IT-21"
                />
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">{errors.group.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                  Tug'ilgan Sana
                </label>
                <input
                  {...register('birth_date')}
                  id="birth_date"
                  type="date"
                  autoComplete="bday"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.birth_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="enrollment_year" className="block text-sm font-medium text-gray-700">
                  O'qishga Kirgan Yil
                </label>
                <input
                  {...register('enrollment_year', { valueAsNumber: true })}
                  id="enrollment_year"
                  type="number"
                  autoComplete="off"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="2021"
                />
                {errors.enrollment_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.enrollment_year.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon (ixtiyoriy)
              </label>
              <input
                {...register('phone')}
                id="phone"
                type="tel"
                autoComplete="tel"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+998901234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Yuklanmoqda...' : 'Ro\'yhatdan O\'tish'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Allaqachon ro'yhatdan o'tganmisiz?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Kirish
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
