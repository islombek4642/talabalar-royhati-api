'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, student, isAuthenticated, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || !student) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Yuklanmoqda...</div>
    </div>;
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      graduated: 'bg-blue-100 text-blue-800',
      expelled: 'bg-red-100 text-red-800',
      academic_leave: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Faol',
      graduated: 'Bitirgan',
      expelled: 'Chetlatilgan',
      academic_leave: 'Akademik Ta\'til',
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Talabalar Portali
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                {student.profile_picture ? (
                  <img
                    src={`http://localhost:3000${student.profile_picture}`}
                    alt={student.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-indigo-600" />
                )}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{student.full_name}</h2>
                <p className="text-indigo-100 mt-1">{student.faculty} - {student.group}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shaxsiy Ma'lumotlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{student.email}</p>
                  </div>
                </div>
              )}

              {student.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="text-gray-900">{student.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tug'ilgan Sana</p>
                  <p className="text-gray-900">
                    {new Date(student.birth_date).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">O'qishga Kirgan Yil</p>
                  <p className="text-gray-900">{student.enrollment_year}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                Profilni Tahrirlash
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Parolni O'zgartirish
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
