'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Edit, Trash2, UserPlus, Download, Upload, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import EditStudentModal from './components/EditStudentModal';
import ImportModal from './components/ImportModal';
import ConfirmModal from './components/ConfirmModal';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  faculty: string;
  group: string;
  enrollment_year: number;
  birth_date: string;
  status: string;
}

function StudentsListPageContent() {
  const searchParams = useSearchParams();
  const facultyFromUrl = searchParams.get('faculty') || '';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState(facultyFromUrl);
  const [adminEmails, setAdminEmails] = useState<Set<string>>(new Set());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
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
    fetchStudents();
    fetchAdminList();
  }, [filterFaculty]);

  const fetchAdminList = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const emails = new Set<string>(
          data.admins
            .map((admin: any) => admin.email)
            .filter((email: string | null) => email !== null && email !== undefined)
        );
        setAdminEmails(emails);
      }
    } catch (error) {
      console.warn('Failed to fetch admin list:', error);
    }
  };

  const isStudentAdmin = (student: Student): boolean => {
    return student.email ? adminEmails.has(student.email) : false;
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/students?limit=10000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      setStudents(result.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Find the student being deleted
      const studentToDelete = students.find(s => s.id === id);
      if (!studentToDelete) {
        alert('Talaba topilmadi');
        return;
      }

      // Check if this student is the current super admin
      const profileResponse = await fetch('http://localhost:3000/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const adminProfile = await profileResponse.json();
        
        // Check if admin email matches student email or names match
        if (adminProfile.email && studentToDelete.email && 
            adminProfile.email === studentToDelete.email) {
          alert(`❌ O'zingizni o'chira olmaysiz!\n\nSiz hozir ${adminProfile.email} email bilan login qilgansiz.\n\nBu student ham xuddi shu email'ga ega.`);
          return;
        }
        
        if (adminProfile.full_name && studentToDelete.full_name && 
            adminProfile.full_name === studentToDelete.full_name) {
          alert(`⚠️ Diqqat!\n\n${studentToDelete.full_name} - bu sizning ismingiz!\n\nO'zingizni o'chirishga ishonchingiz komilmi?`);
          // Allow deletion with extra confirmation
        }
      }
    } catch (error) {
      console.warn('Profile check failed, continuing with delete...', error);
    }

    if (!confirm('Bu talabani o\'chirmoqchimisiz?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'O\'chirishda xatolik');
      }

      fetchStudents();
      alert('✅ Talaba o\'chirildi');
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('❌ Xatolik: ' + (error as Error).message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Iltimos, o\'chirish uchun talabalarni tanlang');
      return;
    }

    // Check if admin is trying to delete themselves
    try {
      const token = localStorage.getItem('admin_token');
      const profileResponse = await fetch('http://localhost:3000/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const adminProfile = await profileResponse.json();
        const selectedStudents = students.filter(s => selectedIds.has(s.id));
        
        // Check if any selected student matches admin email
        const matchingStudent = selectedStudents.find(s => 
          s.email && adminProfile.email && s.email === adminProfile.email
        );

        if (matchingStudent) {
          alert(`❌ O'zingizni o'chira olmaysiz!\n\n${matchingStudent.full_name} (${matchingStudent.email}) - bu siz!\n\nIltimos, o'zingizni tanlovdan chiqaring.`);
          return;
        }
      }
    } catch (error) {
      console.warn('Profile check failed, continuing...', error);
    }

    if (!confirm(`${selectedIds.size} ta talabani o'chirmoqchimisiz?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const idsArray = Array.from(selectedIds);
      console.log('[Bulk Delete] Sending request with IDs:', idsArray);
      
      const response = await fetch('http://localhost:3000/api/v1/students/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: idsArray })
      });

      console.log('[Bulk Delete] Response status:', response.status);
      const data = await response.json();
      console.log('[Bulk Delete] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error?.message || 'Delete failed');
      }

      alert(`${data.count} ta talaba o'chirildi`);
      setSelectedIds(new Set());
      fetchStudents();
    } catch (error) {
      console.error('[Bulk Delete] Error:', error);
      alert('Talabalarni o\'chirishda xatolik yuz berdi: ' + (error as Error).message);
    }
  };

  const handleDeleteAll = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'DIQQAT!',
      message: `Barcha talabalar o'chiriladi (${filteredStudents.length} ta).\n\nTasdiqlash uchun "DELETE_ALL_STUDENTS" deb yozing:`,
      requireInput: true,
      expectedInput: 'DELETE_ALL_STUDENTS',
      isDangerous: true,
      onConfirm: async (value) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        if (value !== 'DELETE_ALL_STUDENTS') {
          alert('Tasdiq matni noto\'g\'ri. O\'chirish bekor qilindi.');
          return;
        }

        console.log('[Delete All] Starting delete all process');

        try {
          const token = localStorage.getItem('admin_token');
          console.log('[Delete All] Sending request');
          
          const response = await fetch('http://localhost:3000/api/v1/students/all', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ confirm: 'DELETE_ALL_STUDENTS' })
          });

          console.log('[Delete All] Response status:', response.status);
          const data = await response.json();
          console.log('[Delete All] Response data:', data);

          if (!response.ok) {
            throw new Error(data.error?.message || 'Delete all failed');
          }

          setSelectedIds(new Set());
          fetchStudents();
          alert(`Barcha talabalar o'chirildi (${data.count} ta)`);
        } catch (error) {
          console.error('[Delete All] Error:', error);
          alert('Barcha talabalarni o\'chirishda xatolik yuz berdi: ' + (error as Error).message);
        }
      }
    });
  };

  const handlePermanentDeleteAll = async () => {
    // First confirmation - text input
    setConfirmModal({
      isOpen: true,
      title: '⚠️ XAVFLI AMAL! ⚠️',
      message: `Barcha talabalar BUTUNLAY bazadan o'chiriladi!\n\n• Ma'lumotlar qayta tiklanmaydi\n• Audit logs yo'qoladi\n• Bu amalni qaytarib bo'lmaydi\n\nTasdiqlash uchun "PERMANENT_DELETE_ALL_STUDENTS" deb yozing:`,
      requireInput: true,
      expectedInput: 'PERMANENT_DELETE_ALL_STUDENTS',
      isDangerous: true,
      onConfirm: async (value) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        if (value !== 'PERMANENT_DELETE_ALL_STUDENTS') {
          alert('Tasdiq matni noto\'g\'ri. O\'chirish bekor qilindi.');
          return;
        }

        // Second confirmation - final warning
        setConfirmModal({
          isOpen: true,
          title: '⚠️ OXIRGI OGOHLANTIRISH!',
          message: `Haqiqatan ham BARCHA talabalarni butunlay o'chirmoqchimisiz?\n\nBu amalni qaytarib bo'lmaydi!`,
          requireInput: false,
          isDangerous: true,
          onConfirm: async () => {
            setConfirmModal({ ...confirmModal, isOpen: false });
            
            console.log('[Permanent Delete] Starting permanent delete');

            try {
              const token = localStorage.getItem('admin_token');
              
              const response = await fetch('http://localhost:3000/api/v1/students/all/permanent', {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirm: 'PERMANENT_DELETE_ALL_STUDENTS' })
              });

              console.log('[Permanent Delete] Response status:', response.status);
              const data = await response.json();
              console.log('[Permanent Delete] Response data:', data);

              if (!response.ok) {
                throw new Error(data.error?.message || 'Permanent delete failed');
              }

              setSelectedIds(new Set());
              fetchStudents();
              alert(`⚠️ ${data.count} ta talaba butunlay bazadan o'chirildi!`);
            } catch (error) {
              console.error('[Permanent Delete] Error:', error);
              alert('Xatolik yuz berdi: ' + (error as Error).message);
            }
          }
        });
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

  const handleMakeAdmin = async (student: Student) => {
    // First check if student is already an admin
    try {
      const token = localStorage.getItem('admin_token');
      
      // Check if this student is already an admin
      const checkResponse = await fetch('http://localhost:3000/api/v1/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (checkResponse.ok) {
        const { admins } = await checkResponse.json();
        const isAlreadyAdmin = admins.some((admin: any) => 
          admin.email === student.email || 
          admin.full_name === student.full_name
        );

        if (isAlreadyAdmin) {
          alert(`⚠️ ${student.full_name} allaqachon Admin!\n\nBu talaba admin ro'yxatida mavjud.`);
          return;
        }
      }
    } catch (error) {
      console.warn('Admin check failed, continuing...', error);
      // Continue with promotion even if check fails
    }

    setConfirmModal({
      isOpen: true,
      title: `Admin qilish - ${student.full_name}`,
      message: `${student.full_name} ni Admin qilmoqchimisiz? U admin panel'ga kirish huquqiga ega bo'ladi.\n\nEmail: ${student.email}\nFakultet: ${student.faculty}\n\n⚠️ Bu amalni bekor qilib bo'lmaydi!`,
      requireInput: false,
      isDangerous: false,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoading(true);
        
        try {
          const token = localStorage.getItem('admin_token');
          
          const response = await fetch(`http://localhost:3000/api/v1/admin/promote-student/${student.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();

          if (!response.ok) {
            // Handle specific errors
            if (data.error?.message?.includes('already an admin')) {
              alert(`⚠️ ${student.full_name} allaqachon Admin!\n\nBu talaba admin ro'yxatida mavjud.`);
            } else if (data.error?.message?.includes('deleted student')) {
              alert(`❌ O'chirilgan talabani Admin qilib bo'lmaydi!\n\nAvval talabani tiklang.`);
            } else if (data.error?.message?.includes('Forbidden')) {
              alert(`❌ Ruxsat yo'q!\n\nFaqat Super Admin talabalarni admin qila oladi.`);
            } else {
              throw new Error(data.error?.message || 'Admin qilishda xatolik');
            }
            return;
          }

          // Success
          alert(`✅ ${student.full_name} muvaffaqiyatli Admin qilindi!\n\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}\n\n📝 Ushbu ma'lumotlarni saqlang!`);
          fetchStudents();
        } catch (error) {
          console.error('Make admin error:', error);
          alert('❌ Xatolik: ' + (error as Error).message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/students/export.csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !filterFaculty || student.faculty === filterFaculty;
    return matchesSearch && matchesFaculty;
  });

  const faculties = Array.from(new Set(students.map(s => s.faculty)));

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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Talabalar</h1>
        <p className="text-gray-600">Jami {students.length} ta talaba</p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        {/* First Row - Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="student-search"
              name="search"
              type="text"
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Faculty Filter */}
          <select
            id="faculty-filter"
            name="faculty_filter"
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Barcha fakultetlar</option>
            {faculties.map(faculty => (
              <option key={faculty} value={faculty}>{faculty}</option>
            ))}
          </select>
        </div>

        {/* Second Row - Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Import Button */}
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            <Upload className="w-5 h-5" />
            Import CSV
          </button>

          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>

          {/* Bulk Delete Button */}
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
            >
              <Trash2 className="w-5 h-5" />
              Tanlanganlarni o'chirish ({selectedIds.size})
            </button>
          )}

          {/* Delete All Button - Soft Delete */}
          <button 
            onClick={handleDeleteAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto sm:ml-auto"
          >
            <Trash2 className="w-5 h-5" />
            Barchasini o'chirish (Soft)
          </button>

          {/* Permanent Delete All Button - Hard Delete */}
          <button 
            onClick={handlePermanentDeleteAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-950 transition-colors border-2 border-yellow-400 w-full sm:w-auto"
            title="⚠️ Bazadan butunlay o'chiradi - qaytarib bo'lmaydi!"
          >
            <Trash2 className="w-5 h-5" />
            ⚠️ Butunlay o'chirish
          </button>

          {/* Restore/Deleted Students Link */}
          <Link
            href="/admin/dashboard/students/deleted"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5" />
            O'chirilganlar
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talaba
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fakultet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guruh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={() => isStudentAdmin(student) ? null : toggleSelect(student.id)}
                      disabled={isStudentAdmin(student)}
                      className={`w-4 h-4 border-gray-300 rounded focus:ring-purple-500 ${
                        isStudentAdmin(student) 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-purple-600'
                      }`}
                      title={isStudentAdmin(student) ? "Admin'ni tanlab bo'lmaydi" : ""}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{student.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-sm text-gray-500">{student.phone || '-'}</div>
                      </div>
                      {isStudentAdmin(student) && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.faculty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.group}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.enrollment_year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!isStudentAdmin(student) && (
                        <button
                          onClick={() => handleMakeAdmin(student)}
                          className="text-green-600 hover:text-green-900"
                          title="Admin qilish"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => isStudentAdmin(student) ? null : setEditingStudent(student)}
                        className={`${isStudentAdmin(student) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-900'}`}
                        title={isStudentAdmin(student) ? "Admin'ni tahrirlash mumkin emas" : "Tahrirlash"}
                        disabled={isStudentAdmin(student)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => isStudentAdmin(student) ? null : handleDelete(student.id)}
                        className={`${isStudentAdmin(student) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                        title={isStudentAdmin(student) ? "Admin'ni o'chirish mumkin emas" : "O'chirish"}
                        disabled={isStudentAdmin(student)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Talaba topilmadi</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onUpdate={() => {
            fetchStudents();
            setEditingStudent(null);
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchStudents();
            // Don't close modal here - let modal handle its own closing
          }}
        />
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

// Wrap with Suspense for useSearchParams
export default function StudentsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    }>
      <StudentsListPageContent />
    </Suspense>
  );
}
