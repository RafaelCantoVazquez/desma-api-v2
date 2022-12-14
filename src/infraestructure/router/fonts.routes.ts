import express, { Router } from 'express';
import {
  getFonts,
  createFonts,
  updateFonts,
  deleteFonts,
} from '../controllers/fonts.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router
  .route('/:id')
  .get(protect, getFonts)
  .put(protect, updateFonts)
  .delete(protect, deleteFonts);
router.post('/', protect, createFonts);

export { router as fontsRoutes };
