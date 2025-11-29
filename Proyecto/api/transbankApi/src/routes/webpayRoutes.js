import { Router } from 'express';
import {
  createPayment,
  commitPayment,
  refundPayment
} from '../controllers/webpayController.js';

const router = Router();

// Rutas de ejemplo
router.post('/create', createPayment);
router.post('/commit', commitPayment);
router.post('/refund', refundPayment);

export default router;