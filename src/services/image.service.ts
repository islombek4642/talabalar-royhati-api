import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/profiles';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB (increased for high quality images)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

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

    // Save original file without any processing
    // Keep the original format (JPG, PNG, WebP)
    const ext = file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Save original file as-is - NO PROCESSING!
    await fs.writeFile(filepath, file.buffer);
    
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
      .resize(800, 800, { 
        fit: 'cover',
        withoutEnlargement: true
      })
      .webp({ quality: 90 })
      .toBuffer();
  }
};
