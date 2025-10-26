'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trash2, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '../components/ConfirmModal';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  faculty: string;
  group: string;
  enrollment_year: number;
  deleted_at: string;
}

export default function DeletedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [retentionDays, setRetentionDays] = useState(30);
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    requireInput?: boolean;
    expectedInput?: string;
    isDangerous?: boolean;
    onConfirm: (value?: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchDeletedStudents();
  }, []);

  const fetchDeletedStudents = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('Token topilmadi. Qayta login qiling.');
        return;
      }

      console.log('[Deleted Students] Fetching from API...');
      
      const response = await fetch('http://localhost:3000/api/v1/students/deleted', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[Deleted Students] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Deleted Students] Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch');
      }

      const data = await response.json();
      console.log('[Deleted Students] Data:', data);
      
      setStudents(data.students || []);
      if (data.retention_days) {
        setRetentionDays(data.retention_days);
      }
    } catch (error) {
      console.error('[Deleted Students] Fetch error:', error);
      alert('O\'chirilgan talabalarni yuklashda xatolik: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, fullName: string) => {
    if (!confirm(`${fullName}ni qayta tiklamoqchimisiz?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/students/${id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to restore');

      alert(`${fullName} qayta tiklandi!`);
      setSelectedIds(new Set());
      fetchDeletedStudents();
    } catch (error) {
      console.error('Error restoring student:', error);
      alert('Qayta tiklashda xatolik yuz berdi');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`${selectedIds.size} ta talabani qayta tiklamoqchimisiz?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/students/bulk-restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      if (!response.ok) throw new Error('Failed to bulk restore');

      const data = await response.json();
      alert(`${data.count} ta talaba qayta tiklandi!`);
      setSelectedIds(new Set());
      fetchDeletedStudents();
    } catch (error) {
      console.error('Error bulk restoring:', error);
      alert('Tanlanganlarni qayta tiklashda xatolik');
    }
  };

  const handleRestoreAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hammasini Qayta Tiklash',
      message: `Barcha ${filteredStudents.length} ta o'chirilgan talabani qayta tiklamoqchimisiz?\n\nTasdiqlash uchun "RESTORE_ALL_STUDENTS" deb yozing:`,
      requireInput: true,
      expectedInput: 'RESTORE_ALL_STUDENTS',
      isDangerous: false,
      onConfirm: async (value) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        if (value !== 'RESTORE_ALL_STUDENTS') {
          alert('Tasdiq matni noto\'g\'ri.');
          return;
        }

        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch('http://localhost:3000/api/v1/students/restore-all', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ confirm: 'RESTORE_ALL_STUDENTS' })
          });

          if (!response.ok) throw new Error('Failed to restore all');

          const data = await response.json();
          alert(`${data.count} ta talaba qayta tiklandi!`);
          setSelectedIds(new Set());
          fetchDeletedStudents();
        } catch (error) {
          console.error('Error restoring all:', error);
          alert('Hammasini qayta tiklashda xatolik');
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Filtered students
  const filteredStudents = students.filter(student => {
    if (filterFaculty && student.faculty !== filterFaculty) return false;
    if (filterGroup && student.group !== filterGroup) return false;
    return true;
  });

  // Get unique faculties and groups
  const faculties = Array.from(new Set(students.map(s => s.faculty)));
  const groups = Array.from(new Set(students.map(s => s.group)));

  // Calculate remaining days
  const getRemainingDays = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const expiration = new Date(deleted);
    expiration.setDate(expiration.getDate() + retentionDays);
    
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get color based on remaining days
  const getRemainingDaysColor = (days: number) => {
    if (days <= 0) return 'text-red-700 bg-red-100 border-red-300';
    if (days <= 7) return 'text-orange-700 bg-orange-100 border-orange-300';
    if (days <= 14) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return 'text-green-700 bg-green-100 border-green-300';
  };

  // Format remaining days text
  const formatRemainingDays = (days: number) => {
    if (days <= 0) return 'Muddati o\'tgan!';
    if (days === 1) return '1 kun qoldi';
    return `${days} kun qoldi`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/dashboard/students"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          O'chirilgan Talabalar ({students.length})
        </h1>
        <p className="text-gray-600 mt-2">
          Soft delete qilingan talabalarni ko'ring va qayta tiklang
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-700">
              ⏰ Zahirada <strong>{retentionDays} kun</strong> saqlanadi
            </span>
          </div>
          <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-700">
              ⚠️ Muddat o'tgach avtomatik o'chiriladi
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      {students.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="">Barcha fakultetlar</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>

            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <div className="flex-1"></div>

            {/* Action Buttons */}
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkRestore}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Tanlanganlarni tiklash ({selectedIds.size})
              </button>
            )}

            <button
              onClick={handleRestoreAll}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Hammasini tiklash
            </button>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600">
            Ko'rsatilmoqda: {filteredStudents.length} ta / {students.length} ta
          </p>
        </div>
      )}

      {/* Table */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">O'chirilgan talabalar yo'q</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Talaba
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fakultet / Guruh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    O'chirilgan vaqti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Qolgan muddat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelect(student.id)}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {selectedIds.has(student.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{student.faculty}</div>
                        <div className="text-sm text-gray-500">{student.group}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(student.deleted_at).toLocaleString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const remaining = getRemainingDays(student.deleted_at);
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRemainingDaysColor(remaining)}`}>
                            {formatRemainingDays(remaining)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRestore(student.id, student.full_name)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Qayta tiklash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        requireInput={confirmModal.requireInput}
        inputPlaceholder={confirmModal.expectedInput}
        expectedInput={confirmModal.expectedInput}
        isDangerous={confirmModal.isDangerous}
      />
    </div>
  );
}
