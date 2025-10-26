'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, UserMinus, RefreshCw, Edit, Crown, User, Power } from 'lucide-react';
import EditAdminModal from './components/EditAdminModal';

interface Admin {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default function AdminsListPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profile = await response.json();
        setCurrentUserRole(profile.role || null);
        setCurrentUserId(profile.id || null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/v1/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('❌ Ruxsat yo\'q!\n\nFaqat Super Admin adminlar ro\'yxatini ko\'ra oladi.');
          return;
        }
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      alert('Adminlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async (admin: Admin) => {
    if (admin.role === 'SUPER_ADMIN') {
      alert('❌ Super Admin\'ni demote qilib bo\'lmaydi!');
      return;
    }

    // Confirmation already handled by custom modal
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/admin/demote/${admin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.message?.includes('Cannot demote super admin')) {
          alert('❌ Super Admin\'ni demote qilib bo\'lmaydi!');
        } else if (data.error?.message?.includes('Forbidden')) {
          alert('❌ Ruxsat yo\'q!\n\nFaqat Super Admin adminlarni demote qila oladi.');
        } else {
          throw new Error(data.error?.message || 'Demote failed');
        }
        return;
      }

      alert(`✅ ${admin.username} adminlikdan olindi`);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to demote admin:', error);
      alert('❌ Xatolik: ' + (error as Error).message);
    }
  };

  const handleSaveAdmin = async (updatedData: Partial<Admin>) => {
    if (!editingAdmin) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/admin/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Update failed');
      }

      alert(`✅ ${editingAdmin.username} muvaffaqiyatli yangilandi`);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to update admin:', error);
      alert('❌ Xatolik: ' + (error as Error).message);
    }
  };

  const toggleAdminRole = async (admin: Admin) => {
    if (admin.id === currentUserId) {
      alert('❌ O\'zingizning role\'ingizni o\'zgartira olmaysiz!');
      return;
    }

    const newRole = admin.role === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
    const roleText = newRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Oddiy Admin';

    // Confirmation already handled by custom modal
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/admin/${admin.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Role update failed');
      }

      alert(`✅ ${admin.username} endi ${roleText}`);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to toggle role:', error);
      alert('❌ Xatolik: ' + (error as Error).message);
    }
  };

  const toggleAdminStatus = async (admin: Admin) => {
    if (admin.id === currentUserId) {
      alert('❌ O\'zingizni nofaol qilib bo\'lmaydi!');
      return;
    }

    const newStatus = !admin.is_active;
    const statusText = newStatus ? 'faol' : 'nofaol';

    // Confirmation already handled by custom modal
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/v1/admin/${admin.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Status update failed');
      }

      alert(`✅ ${admin.username} ${statusText} qilindi`);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('❌ Xatolik: ' + (error as Error).message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hech qachon';
    return new Date(dateString).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Adminlar ro'yhati
            </h1>
            <p className="text-gray-600">
              {admins.length} ta admin • {admins.filter(a => a.role === 'SUPER_ADMIN').length} Super Admin
            </p>
          </div>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
        </div>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ma'lumotlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oxirgi login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isSuperAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.role === 'SUPER_ADMIN' ? (
                          <ShieldCheck className="w-5 h-5 text-purple-600 mr-2" />
                        ) : (
                          <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {admin.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.full_name || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {admin.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.role === 'SUPER_ADMIN' ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          👑 SUPER ADMIN
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          🔧 ADMIN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.last_login_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Faol
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Nofaol
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {admin.id === currentUserId ? (
                          <span className="text-gray-400 text-sm italic">
                            Siz
                          </span>
                        ) : (
                          <button
                            onClick={() => setEditingAdmin(admin)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            Boshqarish
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {admins.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Admin topilmadi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hozircha adminlar ro'yxati bo'sh
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Admin Role'lari
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                <strong>👑 SUPER ADMIN:</strong> Barcha huquqlar, adminlarni boshqarish
              </p>
              <p>
                <strong>🔧 ADMIN:</strong> Talabalarni boshqarish, statistika ko'rish
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSave={handleSaveAdmin}
          onToggleRole={toggleAdminRole}
          onToggleStatus={toggleAdminStatus}
          onDemote={handleDemote}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
