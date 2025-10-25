import { api } from './api';

export const profilePictureService = {
  async upload(file: File): Promise<{ profile_picture: string }> {
    // Validate file type (including HEIC for iPhone photos)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Faqat JPG, PNG, WebP va HEIC formatlariga ruxsat berilgan');
    }

    // Validate file size (max 10MB for high quality)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Rasm hajmi 10MB dan oshmasligi kerak');
    }

    const formData = new FormData();
    formData.append('picture', file);

    const response = await api.post<{ profile_picture: string; student: any }>(
      '/api/v1/student/me/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { profile_picture: response.data.profile_picture };
  },

  async delete(): Promise<void> {
    await api.delete('/api/v1/student/me/profile-picture');
  },

  getImageUrl(path: string | null): string {
    if (!path) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  },
};
