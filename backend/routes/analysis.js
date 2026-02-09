import express from 'express';
import { 
  analyzeCode, 
  getHistory, 
  deleteAnalysis,
  getAnalysisStats,
  analyzeAllAtOnce
} from '../controllers/analysisController.js';
import { authenticateToken  } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', authenticateToken, analyzeCode);
router.post('/analyze-all', authenticateToken, analyzeAllAtOnce);
router.get('/history', authenticateToken, getHistory);
router.get('/stats', authenticateToken, getAnalysisStats);
router.delete('/:id', authenticateToken, deleteAnalysis);


export default router;
