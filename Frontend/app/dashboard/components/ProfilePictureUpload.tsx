'use client';

import { useState, useRef } from 'react';
import { Camera, Trash2, Upload, X } from 'lucide-react';
import { profilePictureService } from '@/lib/profilePicture';
import { useAuthStore } from '@/store/authStore';

interface ProfilePictureUploadProps {
  currentPicture: string | null;
  onUploadSuccess: (newPicturePath: string) => void;
  onDeleteSuccess: () => void;
}

export default function ProfilePictureUpload({
  currentPicture,
  onUploadSuccess,
  onDeleteSuccess,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const result = await profilePictureService.upload(file);
      
      // Update local storage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.student.profile_picture = result.profile_picture;
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      onUploadSuccess(result.profile_picture);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Rasm yuklashda xatolik');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Profil rasmini o\'chirmoqchimisiz?')) return;

    try {
      setIsDeleting(true);
      setError(null);

      await profilePictureService.delete();

      // Update local storage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.student.profile_picture = null;
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      onDeleteSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Rasmni o\'chirishda xatolik');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const imageUrl = currentPicture
    ? profilePictureService.getImageUrl(currentPicture)
    : null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Current Picture */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="picture-upload"
          />
          
          {!preview ? (
            <div className="flex gap-2">
              <label
                htmlFor="picture-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Rasm Yuklash
              </label>

              {currentPicture && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      O'chirilmoqda...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Saqlash
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Bekor Qilish
              </button>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG yoki WebP. Maksimal 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
