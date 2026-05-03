import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /series/create
 * Create a new series
 * Requires: ARCHMAGE tier
 */
router.post('/create', tierCheck('ARCHMAGE'), async (req, res) => {
  const { title, description, stories } = req.body;
  const userId = req.auth.id;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  logger.info('Creating series', {
    userId,
    title,
  });

  res.json({
    success: true,
    message: 'Series created successfully',
    series: {
      id: 'series_' + Date.now(),
      title,
      description,
      stories: stories || [],
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /series/:seriesId
 * Retrieve a series
 * Requires: ARCHMAGE tier
 */
router.get('/:seriesId', tierCheck('ARCHMAGE'), async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving series', {
    userId,
    seriesId,
  });

  res.json({
    id: seriesId,
    title: 'Sample Series',
    description: 'A series of interconnected stories',
    stories: [],
    createdAt: new Date().toISOString(),
  });
});

/**
 * PUT /series/:seriesId
 * Update a series
 * Requires: ARCHMAGE tier
 */
router.put('/:seriesId', tierCheck('ARCHMAGE'), async (req, res) => {
  const { seriesId } = req.params;
  const { title, description, stories } = req.body;
  const userId = req.auth.id;

  logger.info('Updating series', {
    userId,
    seriesId,
  });

  res.json({
    success: true,
    message: 'Series updated successfully',
    series: {
      id: seriesId,
      title,
      description,
      stories,
      updatedAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /series/:seriesId/add-story
 * Add a story to a series
 * Requires: ARCHMAGE tier
 */
router.post('/:seriesId/add-story', tierCheck('ARCHMAGE'), async (req, res) => {
  const { seriesId } = req.params;
  const { storyId, order } = req.body;
  const userId = req.auth.id;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required' });
  }

  logger.info('Adding story to series', {
    userId,
    seriesId,
    storyId,
    order,
  });

  res.json({
    success: true,
    message: 'Story added to series successfully',
  });
});

/**
 * DELETE /series/:seriesId
 * Delete a series
 * Requires: ARCHMAGE tier
 */
router.delete('/:seriesId', tierCheck('ARCHMAGE'), async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.auth.id;

  logger.info('Deleting series', {
    userId,
    seriesId,
  });

  res.json({
    success: true,
    message: 'Series deleted successfully',
  });
});

export default router;