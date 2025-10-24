import { Router } from 'express';
import { studentAuthController } from '../controllers/student-auth.controller';
import { validate } from '../middlewares/validate';
import { 
  registerStudentSchema, 
  loginStudentSchema,
  updateProfileSchema,
  changePasswordSchema 
} from '../schemas/student-auth.schema';
import { requireAuth } from '../middlewares/auth';
import { authLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { env } from '../config/env';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerStudentSchema, 'body'), studentAuthController.register);
router.post('/login', authLimiter, validate(loginStudentSchema, 'body'), studentAuthController.login);

// Protected routes (Student only)
router.get('/me', requireAuth(env.JWT_SECRET), studentAuthController.getProfile);
router.patch('/me', requireAuth(env.JWT_SECRET), writeLimiter, validate(updateProfileSchema, 'body'), studentAuthController.updateProfile);
router.post('/change-password', requireAuth(env.JWT_SECRET), writeLimiter, validate(changePasswordSchema, 'body'), studentAuthController.changePassword);
router.post('/logout', requireAuth(env.JWT_SECRET), studentAuthController.logout);

// Profile picture (reuse students controller)
import { studentsController } from '../controllers/students.controller';
router.post('/me/profile-picture', requireAuth(env.JWT_SECRET), writeLimiter, uploadImage.single('picture'), async (req, res, next) => {
  // Inject student_id from JWT
  const studentId = (req as any).user?.student_id;
  if (!studentId) {
    return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
  }
  req.params.id = studentId;
  studentsController.uploadProfilePicture(req, res, next);
});

router.delete('/me/profile-picture', requireAuth(env.JWT_SECRET), writeLimiter, async (req, res, next) => {
  const studentId = (req as any).user?.student_id;
  if (!studentId) {
    return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
  }
  req.params.id = studentId;
  studentsController.deleteProfilePicture(req, res, next);
});

export default router;
