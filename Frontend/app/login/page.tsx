'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Eye, EyeOff, GraduationCap, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Noto\'g\'ri email format'),
  password: z.string().min(1, 'Parol kiriting'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, isInitialized, loadFromStorage } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (error: any): string => {
    const errorMessage = error.response?.data?.error?.message || '';
    
    // Translate common errors to Uzbek
    if (errorMessage.includes('Invalid email or password') || 
        errorMessage.includes('Invalid credentials') ||
        errorMessage.includes('Unauthorized')) {
      return 'Email yoki parol noto\'g\'ri. Iltimos, qaytadan urinib ko\'ring.';
    }
    if (errorMessage.includes('User not found') || errorMessage.includes('not found')) {
      return 'Bu email ro\'yhatdan o\'tmagan. Iltimos, avval ro\'yhatdan o\'ting.';
    }
    if (errorMessage.includes('Account is disabled') || errorMessage.includes('not active')) {
      return 'Sizning akkauntingiz bloklangan. Administrator bilan bog\'laning.';
    }
    if (errorMessage.includes('network') || error.code === 'ERR_NETWORK') {
      return 'Internet aloqasi yo\'q. Iltimos, internetni tekshiring.';
    }
    
    return errorMessage || 'Tizimga kirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data);
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
            Tizimga Kirish
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
                  autoComplete="current-password"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hali ro'yhatdan o'tmaganmisiz?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ro'yhatdan O'tish
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
