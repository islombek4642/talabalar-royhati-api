import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/profiles';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const imageService = {
  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > MAX_SIZE) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    await ensureUploadDir();

    // Generate unique filename
    const filename = `${randomUUID()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Process image: resize, optimize, convert to WebP
    await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    // Return relative path
    return `/uploads/profiles/${filename}`;
  },

  async deleteProfilePicture(picturePath: string): Promise<void> {
    if (!picturePath) return;

    try {
      // Extract filename from path
      const filename = path.basename(picturePath);
      const filepath = path.join(UPLOAD_DIR, filename);
      
      // Delete file
      await fs.unlink(filepath);
    } catch (error) {
      // File might not exist, ignore error
      console.error('Error deleting profile picture:', error);
    }
  },

  async validateAndProcessImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    if (!ALLOWED_TYPES.includes(mimetype)) {
      throw new Error('Invalid file type');
    }

    // Process and return optimized image
    return await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();
  }
};
