'use client';

import { useState, useEffect } from 'react';
import { X, Crown, User, Power, UserMinus, Save } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

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

interface EditAdminModalProps {
  admin: Admin | null;
  onClose: () => void;
  onSave: (updatedAdmin: Partial<Admin>) => void;
  onToggleRole?: (admin: Admin) => Promise<void> | void;
  onToggleStatus?: (admin: Admin) => Promise<void> | void;
  onDemote?: (admin: Admin) => Promise<void> | void;
  currentUserId?: string | null;
}

export default function EditAdminModal({ 
  admin, 
  onClose, 
  onSave,
  onToggleRole,
  onToggleStatus,
  onDemote,
  currentUserId
}: EditAdminModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
    is_active: true
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        full_name: admin.full_name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        role: admin.role,
        is_active: admin.is_active
      });
    }
  }, [admin]);

  if (!admin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isSelf = admin?.id === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      {/* Backdrop - clicking closes modal */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Center Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        <div className="overflow-y-auto max-h-[90vh]">
        <style jsx>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Admin tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username (readonly) */}
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              value={admin.username}
              disabled
              autoComplete="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Username o'zgartirib bo'lmaydi</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="admin-full-name" className="block text-sm font-medium text-gray-700 mb-1">
              To'liq ism
            </label>
            <input
              id="admin-full-name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Islombek Xamidullayev"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="admin-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              id="admin-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              autoComplete="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+998 90 123 45 67"
            />
          </div>

          {/* Role - Display Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hozirgi Role
            </label>
            <div className={`w-full px-3 py-2 border-2 rounded-lg ${
              formData.role === 'SUPER_ADMIN' 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-blue-300 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {formData.role === 'SUPER_ADMIN' ? (
                  <>
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="font-semibold text-purple-700">SUPER ADMIN</div>
                      <div className="text-xs text-purple-600">Barcha huquqlar</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🔧</span>
                    <div>
                      <div className="font-semibold text-blue-700">ADMIN</div>
                      <div className="text-xs text-blue-600">Oddiy admin</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!isSelf && (
              <p className="mt-1 text-xs text-gray-500">
                💡 Role'ni o'zgartirish uchun pastdagi "Boshqa amallar" dan foydalaning
              </p>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label htmlFor="admin-is-active" className="flex items-center gap-2 cursor-pointer">
              <input
                id="admin-is-active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Faol (Login qila oladi)
              </span>
            </label>
            {!formData.is_active && (
              <p className="mt-1 text-xs text-red-600">
                ⚠️ Faol emas holatda admin login qila olmaydi
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <Save className="w-5 h-5" />
              Saqlash
            </button>
          </div>
        </form>

        {/* Action Buttons Section */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Boshqa amallar</h3>

          {/* Self-editing message */}
          {isSelf ? (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-700 font-medium mb-1">
                👤 Siz o'zingizni tahrirlayapsiz
              </div>
              <div className="text-blue-600 text-sm">
                Xavfsizlik uchun o'zingizning role va status'ingizni o'zgartira olmaysiz
              </div>
            </div>
          ) : (
            <>
              {/* Toggle Role */}
              {onToggleRole && (
            <button
              onClick={() => {
                const newRole = formData.role === 'SUPER_ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';
                
                // Show custom confirmation dialog
                setConfirmDialog({
                  isOpen: true,
                  title: newRole === 'SUPER_ADMIN' ? '⚠️ DIQQAT!' : 'Role o\'zgartirish',
                  message: newRole === 'SUPER_ADMIN'
                    ? `${admin.username}ni SUPER ADMIN qilmoqchimisiz?\n\nSuper Admin:\n• Barcha adminlarni boshqarishi mumkin\n• Adminlarni promote/demote qila oladi\n• Barcha huquqlarga ega`
                    : `${admin.username}ni oddiy Admin qilmoqchimisiz?\n\nSuper Admin huquqlarini yo'qotadi.`,
                  type: newRole === 'SUPER_ADMIN' ? 'warning' : 'info',
                  onConfirm: async () => {
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    // Update local formData first for immediate visual feedback
                    setFormData({ ...formData, role: newRole as 'SUPER_ADMIN' | 'ADMIN' });
                    // Then call the backend
                    await onToggleRole(admin);
                  }
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                formData.role === 'SUPER_ADMIN'
                  ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                  : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {formData.role === 'SUPER_ADMIN' ? (
                <>
                  <User className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Oddiy Admin qilish</div>
                    <div className="text-xs opacity-75">Super Admin huquqlarini olish</div>
                  </div>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Super Admin qilish</div>
                    <div className="text-xs opacity-75">Barcha huquqlarni berish</div>
                  </div>
                </>
              )}
            </button>
          )}

          {/* Toggle Status */}
          {onToggleStatus && (
            <button
              onClick={() => {
                const newStatus = !formData.is_active;
                
                // Show custom confirmation dialog
                setConfirmDialog({
                  isOpen: true,
                  title: newStatus ? 'Admin faollashtirish' : '⚠️ Admin nofaol qilish',
                  message: newStatus
                    ? `${admin.username}ni faol qilmoqchimisiz?\n\nFaol holat:\n• Admin login qila oladi\n• Barcha funksiyalardan foydalana oladi`
                    : `${admin.username}ni nofaol qilmoqchimisiz?\n\nNofaol holat:\n• Admin login qila olmaydi\n• Tizimga kira olmaydi`,
                  type: newStatus ? 'info' : 'warning',
                  onConfirm: async () => {
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    // Update local formData first for immediate visual feedback
                    setFormData({ ...formData, is_active: newStatus });
                    // Then call backend
                    await onToggleStatus(admin);
                  }
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                formData.is_active
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Power className="w-5 h-5" />
              <div className="text-left flex-1">
                <div className="font-semibold">
                  {formData.is_active ? 'Nofaol qilish' : 'Faol qilish'}
                </div>
                <div className="text-xs opacity-75">
                  {formData.is_active 
                    ? 'Admin login qila olmaydi' 
                    : 'Admin login qila oladi'
                  }
                </div>
              </div>
            </button>
          )}

              {/* Demote */}
              {formData.role !== 'SUPER_ADMIN' && onDemote && (
                <button
                  onClick={() => {
                    // Show dangerous confirmation dialog
                    setConfirmDialog({
                      isOpen: true,
                      title: '🗑️ XAVFLI AMAL!',
                      message: `${admin.username}ni adminlikdan butunlay olib tashlamoqchimisiz?\n\nBu amal:\n• Admin accountni o'chiradi\n• Login qila olmaydi\n• Qaytarib bo'lmaydi\n\nRostdan ham davom etasizmi?`,
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                        onClose(); // Close modal before deleting
                        await onDemote(admin);
                      }
                    });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                >
                  <UserMinus className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Adminlikdan olish</div>
                    <div className="text-xs opacity-75">Admin accountni o'chirish</div>
                  </div>
                </button>
              )}
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Yopish
          </button>
        </div>
        </div>
      </div>
      
      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
