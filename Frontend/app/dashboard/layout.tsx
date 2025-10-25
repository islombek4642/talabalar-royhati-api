'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { profilePictureService } from '@/lib/profilePicture';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap 
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, student, isAuthenticated, isInitialized, loadFromStorage } = useAuthStore();

  // Load auth state on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Redirect if not authenticated (but only after initialization)
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profil', href: '/dashboard/profile/edit', icon: User },
    { name: 'Sozlamalar', href: '/dashboard/settings/password', icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
              <p className="text-xs text-gray-500">Talabalar Portali</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {student && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                {student.profile_picture ? (
                  <img
                    src={profilePictureService.getImageUrl(student.profile_picture)}
                    alt={student.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                ) : null}
                {!student.profile_picture && (
                  <User className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {student.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {student.group}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Chiqish</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            © 2025 Student Portal
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        {/* Transparent overlay when sidebar is open (mobile) */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          />
        )}
        {children}
      </main>
    </div>
  );
}
