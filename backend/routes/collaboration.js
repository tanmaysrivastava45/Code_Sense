import express from 'express';
import {
  createRoom,
  deleteRoom,
  getRoomById,
  getRooms,
} from '../controllers/collaborationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/rooms/create', authenticateToken, createRoom);
router.get('/rooms', authenticateToken, getRooms);
router.get('/rooms/:roomId', authenticateToken, getRoomById);
router.delete('/rooms/:roomId', authenticateToken, deleteRoom);

export default router;

