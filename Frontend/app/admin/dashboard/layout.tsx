'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminUsername = localStorage.getItem('admin_username');
    
    if (!token) {
      router.push('/admin/login');
    } else {
      setUsername(adminUsername || 'Admin');
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm('Tizimdan chiqmoqchimisiz?')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      router.push('/');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Talabalar', href: '/admin/dashboard/students', icon: Users },
    { name: 'Statistika', href: '/admin/dashboard/stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">{username}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
                    ? 'bg-purple-50 text-purple-600'
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
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
