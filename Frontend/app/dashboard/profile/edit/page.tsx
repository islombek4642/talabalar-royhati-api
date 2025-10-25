'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import ProfilePictureUpload from '../../components/ProfilePictureUpload';

const editProfileSchema = z.object({
  full_name: z.string().min(2, 'Ism kamida 2 ta harf bo\'lishi kerak'),
  phone: z.string().optional(),
  faculty: z.string().min(2, 'Fakultet kiriting'),
  group: z.string().min(1, 'Guruh kiriting'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  enrollment_year: z.number().int().min(2000, 'Yil 2000 dan katta bo\'lishi kerak').max(new Date().getFullYear() + 1, 'Noto\'g\'ri yil'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { student, isAuthenticated, isInitialized, loadFromStorage } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (student) {
      console.log('Loading student data into form:', student);
      setValue('full_name', student.full_name);
      setValue('phone', student.phone || '');
      setValue('faculty', student.faculty);
      setValue('group', student.group);
      setValue('enrollment_year', student.enrollment_year || new Date().getFullYear());
      // Safe birth date formatting
      try {
        const date = new Date(student.birth_date);
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toISOString().split('T')[0];
          console.log('Setting birth_date:', formattedDate);
          setValue('birth_date', formattedDate);
        } else {
          console.warn('Invalid birth_date:', student.birth_date);
        }
      } catch (err) {
        console.error('Invalid birth date:', err);
      }
    }
  }, [student, setValue]);

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      console.log('Sending to backend:', data);
      const response = await api.patch('/api/v1/student/me', data);
      console.log('Backend response:', response.data);

      // Update local storage with response from backend
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        // Use backend response data, not just form data
        parsed.student = { ...parsed.student, ...response.data };
        localStorage.setItem('user', JSON.stringify(parsed));
        console.log('Updated localStorage:', parsed.student);
      }

      setSuccess(true);
      loadFromStorage();

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error?.message || 'Profilni yangilashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized || !isAuthenticated || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profilni Tahrirlash</h1>
          <p className="text-gray-600 mt-2">O'z ma'lumotlaringizni yangilang</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              ✅ Profil muvaffaqiyatli yangilandi!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profil Rasmi
              </label>
              <ProfilePictureUpload
                currentPicture={student.profile_picture}
                onUploadSuccess={(newPicture) => {
                  loadFromStorage();
                }}
                onDeleteSuccess={() => {
                  loadFromStorage();
                }}
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                To'liq Ism
              </label>
              <input
                {...register('full_name')}
                id="full_name"
                type="text"
                autoComplete="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ali Valiyev"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Raqam
              </label>
              <input
                {...register('phone')}
                id="phone"
                type="tel"
                autoComplete="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+998901234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Faculty & Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-2">
                  Fakultet
                </label>
                <input
                  {...register('faculty')}
                  id="faculty"
                  type="text"
                  autoComplete="organization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="IT"
                />
                {errors.faculty && (
                  <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                  Guruh
                </label>
                <input
                  {...register('group')}
                  id="group"
                  type="text"
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="IT-21"
                />
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">{errors.group.message}</p>
                )}
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                Tug'ilgan Sana
              </label>
              <input
                {...register('birth_date')}
                id="birth_date"
                type="date"
                autoComplete="bday"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
              )}
            </div>

            {/* Enrollment Year */}
            <div>
              <label htmlFor="enrollment_year" className="block text-sm font-medium text-gray-700 mb-2">
                O'qishga Kirgan Yil
              </label>
              <input
                {...register('enrollment_year', { valueAsNumber: true })}
                id="enrollment_year"
                type="number"
                autoComplete="off"
                min="2000"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2024"
              />
              {errors.enrollment_year && (
                <p className="mt-1 text-sm text-red-600">{errors.enrollment_year.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Saqlash
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
                Bekor Qilish
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
