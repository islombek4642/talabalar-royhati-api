import { Router } from 'express';
import { studentsController } from '../controllers/students.controller';
import { validate } from '../middlewares/validate';
import { createStudentSchema, updateStudentSchema, getStudentsQuerySchema } from '../schemas/student.schema';
import { requireAuth } from '../middlewares/auth';
import { publicLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { env } from '../config/env';
import { uploadCsv, uploadImage } from '../middlewares/upload';

const router = Router();

router.get('/', publicLimiter, validate(getStudentsQuerySchema, 'query'), studentsController.list);
router.get('/export.csv', publicLimiter, validate(getStudentsQuerySchema, 'query'), studentsController.exportCsv);
router.post('/import', requireAuth(env.JWT_SECRET), writeLimiter, uploadCsv.single('file'), studentsController.importCsv);
router.post('/', requireAuth(env.JWT_SECRET), writeLimiter, validate(createStudentSchema, 'body'), studentsController.create);
router.post('/bulk-delete', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.bulkDelete);
router.delete('/all', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.deleteAll);
router.delete('/all/permanent', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.permanentDeleteAll);
router.get('/deleted', requireAuth(env.JWT_SECRET), publicLimiter, studentsController.getDeleted);
router.post('/restore-all', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.restoreAll);
router.post('/bulk-restore', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.bulkRestore);
router.post('/:id/restore', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.restore);
router.get('/:id', publicLimiter, studentsController.getById);
router.patch('/:id', requireAuth(env.JWT_SECRET), writeLimiter, validate(updateStudentSchema, 'body'), studentsController.update);
router.delete('/:id', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.remove);

// Profile picture routes
router.post('/:id/profile-picture', requireAuth(env.JWT_SECRET), writeLimiter, uploadImage.single('picture'), studentsController.uploadProfilePicture);
router.delete('/:id/profile-picture', requireAuth(env.JWT_SECRET), writeLimiter, studentsController.deleteProfilePicture);

export default router;
