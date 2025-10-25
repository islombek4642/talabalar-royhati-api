import { api } from './api';

export const profilePictureService = {
  async upload(file: File): Promise<{ profile_picture: string }> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Faqat JPG, PNG va WebP formatlariga ruxsat berilgan');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Rasm hajmi 5MB dan oshmasligi kerak');
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
