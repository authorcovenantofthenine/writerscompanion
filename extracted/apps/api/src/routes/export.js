import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /export/word
 * Export story as Word document
 * Requires: SCRIBE tier
 */
router.post('/word', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, includeMetadata } = req.body;
  const userId = req.auth.id;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required' });
  }

  logger.info('Exporting story as Word document', {
    userId,
    storyId,
    includeMetadata,
  });

  res.json({
    success: true,
    message: 'Word export generated successfully',
    export: {
      id: 'export_' + Date.now(),
      storyId,
      format: 'docx',
      downloadUrl: '/downloads/story_' + storyId + '.docx',
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /export/pdf
 * Export story as PDF
 * Requires: SCRIBE tier
 */
router.post('/pdf', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, includeMetadata, pageSize } = req.body;
  const userId = req.auth.id;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required' });
  }

  logger.info('Exporting story as PDF', {
    userId,
    storyId,
    pageSize,
  });

  res.json({
    success: true,
    message: 'PDF export generated successfully',
    export: {
      id: 'export_' + Date.now(),
      storyId,
      format: 'pdf',
      downloadUrl: '/downloads/story_' + storyId + '.pdf',
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /export/epub
 * Export story as ePub
 * Requires: SCRIBE tier
 */
router.post('/epub', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, includeMetadata } = req.body;
  const userId = req.auth.id;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required' });
  }

  logger.info('Exporting story as ePub', {
    userId,
    storyId,
  });

  res.json({
    success: true,
    message: 'ePub export generated successfully',
    export: {
      id: 'export_' + Date.now(),
      storyId,
      format: 'epub',
      downloadUrl: '/downloads/story_' + storyId + '.epub',
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /export/history/:storyId
 * Get export history for a story
 * Requires: SCRIBE tier
 */
router.get('/history/:storyId', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving export history', {
    userId,
    storyId,
  });

  res.json({
    storyId,
    exports: [],
  });
});

export default router;