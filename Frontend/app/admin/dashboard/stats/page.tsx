'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

interface FacultyStats {
  faculty: string;
  count: number;
}

export default function StatisticsPage() {
  const [facultyStats, setFacultyStats] = useState<FacultyStats[]>([]);
  const [yearStats, setYearStats] = useState<{ year: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/students?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      const students = result.data || [];

      // Faculty statistics
      const facultyMap = new Map<string, number>();
      students.forEach((s: any) => {
        facultyMap.set(s.faculty, (facultyMap.get(s.faculty) || 0) + 1);
      });
      setFacultyStats(
        Array.from(facultyMap.entries()).map(([faculty, count]) => ({ faculty, count }))
      );

      // Year statistics
      const yearMap = new Map<number, number>();
      students.forEach((s: any) => {
        yearMap.set(s.enrollment_year, (yearMap.get(s.enrollment_year) || 0) + 1);
      });
      setYearStats(
        Array.from(yearMap.entries())
          .map(([year, count]) => ({ year, count }))
          .sort((a, b) => b.year - a.year)
      );
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const maxFacultyCount = Math.max(...facultyStats.map(f => f.count), 1);
  const maxYearCount = Math.max(...yearStats.map(y => y.count), 1);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistika</h1>
        <p className="text-gray-600">Talabalar bo'yicha batafsil statistika</p>
      </div>

      {/* Faculty Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Fakultetlar bo'yicha</h2>
        </div>
        <div className="space-y-4">
          {facultyStats.map((stat) => (
            <div key={stat.faculty} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{stat.faculty}</span>
                <span className="text-sm text-gray-600">{stat.count} talaba</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(stat.count / maxFacultyCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">O'qishga kirgan yillar bo'yicha</h2>
        </div>
        <div className="space-y-4">
          {yearStats.map((stat) => (
            <div key={stat.year} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{stat.year}-yil</span>
                <span className="text-sm text-gray-600">{stat.count} talaba</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(stat.count / maxYearCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
