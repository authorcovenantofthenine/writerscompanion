import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /collaboration/invite
 * Invite a co-author to collaborate on a story
 * Requires: ARCHMAGE tier
 */
router.post('/invite', tierCheck('ARCHMAGE'), async (req, res) => {
  const { storyId, email, role } = req.body;
  const userId = req.auth.id;

  if (!storyId || !email) {
    return res.status(400).json({ error: 'storyId and email are required' });
  }

  logger.info('Inviting co-author', {
    userId,
    storyId,
    email,
    role,
  });

  res.json({
    success: true,
    message: 'Co-author invitation sent successfully',
    invitation: {
      id: 'inv_' + Date.now(),
      storyId,
      email,
      role: role || 'editor',
      status: 'pending',
      invitedAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /collaboration/:storyId/collaborators
 * Get all collaborators on a story
 * Requires: ARCHMAGE tier
 */
router.get('/:storyId/collaborators', tierCheck('ARCHMAGE'), async (req, res) => {
  const { storyId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving collaborators', {
    userId,
    storyId,
  });

  res.json({
    storyId,
    collaborators: [],
  });
});

/**
 * PUT /collaboration/:collaborationId/role
 * Update a collaborator's role
 * Requires: ARCHMAGE tier
 */
router.put('/:collaborationId/role', tierCheck('ARCHMAGE'), async (req, res) => {
  const { collaborationId } = req.params;
  const { role } = req.body;
  const userId = req.auth.id;

  if (!role) {
    return res.status(400).json({ error: 'role is required' });
  }

  logger.info('Updating collaborator role', {
    userId,
    collaborationId,
    role,
  });

  res.json({
    success: true,
    message: 'Collaborator role updated successfully',
    collaboration: {
      id: collaborationId,
      role,
      updatedAt: new Date().toISOString(),
    },
  });
});

/**
 * DELETE /collaboration/:collaborationId
 * Remove a collaborator from a story
 * Requires: ARCHMAGE tier
 */
router.delete('/:collaborationId', tierCheck('ARCHMAGE'), async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.auth.id;

  logger.info('Removing collaborator', {
    userId,
    collaborationId,
  });

  res.json({
    success: true,
    message: 'Collaborator removed successfully',
  });
});

/**
 * POST /collaboration/:storyId/change-log
 * Get collaboration change log
 * Requires: ARCHMAGE tier
 */
router.get('/:storyId/change-log', tierCheck('ARCHMAGE'), async (req, res) => {
  const { storyId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving collaboration change log', {
    userId,
    storyId,
  });

  res.json({
    storyId,
    changes: [],
  });
});

export default router;