import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /timeline/create
 * Create a new timeline for a story
 * Requires: SCRIBE tier
 */
router.post('/create', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, title, description, events } = req.body;
  const userId = req.auth.id;

  if (!storyId || !title) {
    return res.status(400).json({ error: 'storyId and title are required' });
  }

  logger.info('Creating timeline', {
    userId,
    storyId,
    title,
  });

  // Timeline creation logic would go here
  res.json({
    success: true,
    message: 'Timeline created successfully',
    timeline: {
      id: 'timeline_' + Date.now(),
      storyId,
      title,
      description,
      events: events || [],
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /timeline/:timelineId
 * Retrieve a timeline
 * Requires: SCRIBE tier
 */
router.get('/:timelineId', tierCheck('SCRIBE'), async (req, res) => {
  const { timelineId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving timeline', {
    userId,
    timelineId,
  });

  res.json({
    id: timelineId,
    title: 'Sample Timeline',
    description: 'A timeline for your story',
    events: [],
    createdAt: new Date().toISOString(),
  });
});

/**
 * PUT /timeline/:timelineId
 * Update a timeline
 * Requires: SCRIBE tier
 */
router.put('/:timelineId', tierCheck('SCRIBE'), async (req, res) => {
  const { timelineId } = req.params;
  const { title, description, events } = req.body;
  const userId = req.auth.id;

  logger.info('Updating timeline', {
    userId,
    timelineId,
  });

  res.json({
    success: true,
    message: 'Timeline updated successfully',
    timeline: {
      id: timelineId,
      title,
      description,
      events,
      updatedAt: new Date().toISOString(),
    },
  });
});

/**
 * DELETE /timeline/:timelineId
 * Delete a timeline
 * Requires: SCRIBE tier
 */
router.delete('/:timelineId', tierCheck('SCRIBE'), async (req, res) => {
  const { timelineId } = req.params;
  const userId = req.auth.id;

  logger.info('Deleting timeline', {
    userId,
    timelineId,
  });

  res.json({
    success: true,
    message: 'Timeline deleted successfully',
  });
});

export default router;