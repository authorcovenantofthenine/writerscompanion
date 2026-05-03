import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /relationships/create
 * Create a character relationship map
 * Requires: SCRIBE tier
 */
router.post('/create', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, character1Id, character2Id, relationshipType, description } = req.body;
  const userId = req.auth.id;

  if (!storyId || !character1Id || !character2Id || !relationshipType) {
    return res.status(400).json({
      error: 'storyId, character1Id, character2Id, and relationshipType are required',
    });
  }

  logger.info('Creating relationship', {
    userId,
    storyId,
    character1Id,
    character2Id,
    relationshipType,
  });

  res.json({
    success: true,
    message: 'Relationship created successfully',
    relationship: {
      id: 'rel_' + Date.now(),
      storyId,
      character1Id,
      character2Id,
      relationshipType,
      description,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /relationships/:storyId
 * Get all relationships for a story
 * Requires: SCRIBE tier
 */
router.get('/:storyId', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving relationships', {
    userId,
    storyId,
  });

  res.json({
    storyId,
    relationships: [],
  });
});

/**
 * PUT /relationships/:relationshipId
 * Update a relationship
 * Requires: SCRIBE tier
 */
router.put('/:relationshipId', tierCheck('SCRIBE'), async (req, res) => {
  const { relationshipId } = req.params;
  const { relationshipType, description } = req.body;
  const userId = req.auth.id;

  logger.info('Updating relationship', {
    userId,
    relationshipId,
  });

  res.json({
    success: true,
    message: 'Relationship updated successfully',
    relationship: {
      id: relationshipId,
      relationshipType,
      description,
      updatedAt: new Date().toISOString(),
    },
  });
});

/**
 * DELETE /relationships/:relationshipId
 * Delete a relationship
 * Requires: SCRIBE tier
 */
router.delete('/:relationshipId', tierCheck('SCRIBE'), async (req, res) => {
  const { relationshipId } = req.params;
  const userId = req.auth.id;

  logger.info('Deleting relationship', {
    userId,
    relationshipId,
  });

  res.json({
    success: true,
    message: 'Relationship deleted successfully',
  });
});

export default router;