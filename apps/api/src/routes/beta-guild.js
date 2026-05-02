import express from 'express';
import { tierCheck } from '../middleware/tierCheck.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /beta-guild/create
 * Create a beta guild for story feedback
 * Requires: SCRIBE tier
 */
router.post('/create', tierCheck('SCRIBE'), async (req, res) => {
  const { storyId, name, description, members } = req.body;
  const userId = req.auth.id;

  if (!storyId || !name) {
    return res.status(400).json({ error: 'storyId and name are required' });
  }

  logger.info('Creating beta guild', {
    userId,
    storyId,
    name,
  });

  res.json({
    success: true,
    message: 'Beta guild created successfully',
    guild: {
      id: 'guild_' + Date.now(),
      storyId,
      name,
      description,
      members: members || [],
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /beta-guild/:guildId
 * Retrieve a beta guild
 * Requires: SCRIBE tier
 */
router.get('/:guildId', tierCheck('SCRIBE'), async (req, res) => {
  const { guildId } = req.params;
  const userId = req.auth.id;

  logger.info('Retrieving beta guild', {
    userId,
    guildId,
  });

  res.json({
    id: guildId,
    name: 'Sample Beta Guild',
    description: 'A guild for story feedback',
    members: [],
    createdAt: new Date().toISOString(),
  });
});

/**
 * POST /beta-guild/:guildId/invite
 * Invite members to beta guild
 * Requires: SCRIBE tier
 */
router.post('/:guildId/invite', tierCheck('SCRIBE'), async (req, res) => {
  const { guildId } = req.params;
  const { emails } = req.body;
  const userId = req.auth.id;

  if (!emails || !Array.isArray(emails)) {
    return res.status(400).json({ error: 'emails array is required' });
  }

  logger.info('Inviting members to beta guild', {
    userId,
    guildId,
    emailCount: emails.length,
  });

  res.json({
    success: true,
    message: `Invited ${emails.length} members to beta guild`,
    invitations: emails.map((email) => ({
      email,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    })),
  });
});

/**
 * DELETE /beta-guild/:guildId
 * Delete a beta guild
 * Requires: SCRIBE tier
 */
router.delete('/:guildId', tierCheck('SCRIBE'), async (req, res) => {
  const { guildId } = req.params;
  const userId = req.auth.id;

  logger.info('Deleting beta guild', {
    userId,
    guildId,
  });

  res.json({
    success: true,
    message: 'Beta guild deleted successfully',
  });
});

export default router;