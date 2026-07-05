import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { trackingWriteLimiter } from '../middleware/rateLimiter.js';
import {
  getDietProfiles,
  createDietProfile,
  updateDietProfile,
  deleteDietProfile,
  updateDietMealLog,
  updateWaterIntake,
  updateAvatar,
  uploadAvatarFile,
} from '../controllers/diet.controller.js';

const dietRouter = Router();

// Configure multer for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

// Secure all diet recommender endpoints using Supabase JWT
dietRouter.use(authMiddleware);

dietRouter.get('/profiles', getDietProfiles);
dietRouter.post('/profiles', createDietProfile);
dietRouter.put('/profiles/:id', updateDietProfile);
dietRouter.delete('/profiles/:id', deleteDietProfile);
dietRouter.put('/profiles/:id/meals/:mealId', updateDietMealLog);
dietRouter.put('/profiles/:id/water', trackingWriteLimiter, updateWaterIntake);
dietRouter.patch('/profiles/:id/avatar', updateAvatar);
dietRouter.post('/profiles/:id/avatar/upload', upload.single('file'), uploadAvatarFile);

export { dietRouter };
