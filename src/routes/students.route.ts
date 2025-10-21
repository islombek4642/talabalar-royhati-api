import { Router } from 'express';
import { studentsController } from '../controllers/students.controller';
import { validate } from '../middlewares/validate';
import { createStudentSchema, updateStudentSchema, getStudentsQuerySchema } from '../schemas/student.schema';
import { requireAuth } from '../middlewares/auth';
import { env } from '../config/env';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', validate(getStudentsQuerySchema, 'query'), studentsController.list);
router.get('/export.csv', validate(getStudentsQuerySchema, 'query'), studentsController.exportCsv);
router.post('/import', requireAuth(env.JWT_SECRET), upload.single('file'), studentsController.importCsv);
router.post('/', requireAuth(env.JWT_SECRET), validate(createStudentSchema, 'body'), studentsController.create);
router.get('/:id', studentsController.getById);
router.patch('/:id', requireAuth(env.JWT_SECRET), validate(updateStudentSchema, 'body'), studentsController.update);
router.delete('/:id', requireAuth(env.JWT_SECRET), studentsController.remove);

export default router;
