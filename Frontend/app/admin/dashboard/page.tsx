'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  faculties: string[];
  recentYear: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    faculties: [],
    recentYear: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/students?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      const students = result.data || [];
      
      setStats({
        total: students.length,
        active: students.filter((s: any) => s.status === 'active').length,
        faculties: Array.from(new Set(students.map((s: any) => s.faculty))),
        recentYear: Math.max(...students.map((s: any) => s.enrollment_year))
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Jami Talabalar',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Faol Talabalar',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Fakultetlar',
      value: stats.faculties.length,
      icon: GraduationCap,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Eng Yangi Yil',
      value: stats.recentYear,
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Admin panel - Talabalar boshqaruvi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tezkor Havolalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/students"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Talabalar Ro'yhati</p>
                <p className="text-sm text-gray-500">Barcha talabalarni ko'rish</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </Link>

          <Link
            href="/admin/dashboard/stats"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Statistika</p>
                <p className="text-sm text-gray-500">Batafsil statistika</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Faculties List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fakultetlar</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.faculties.map((faculty) => (
            <div
              key={faculty}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <p className="font-medium text-gray-900 text-center">{faculty}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
