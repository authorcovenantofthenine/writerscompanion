import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Tier check middleware factory
 * Creates middleware that validates subscription tier and status
 * @param {string} requiredTier - Required tier: 'SCRIBE' or 'ARCHMAGE'
 * @returns {Function} Express middleware function
 */
export function tierCheck(requiredTier) {
  return async (req, res, next) => {
    // Extract userId from auth context
    const userId = req.auth?.id;

    if (!userId) {
      logger.warn('tierCheck: No userId found in request.auth');
      throw new Error('Authentication required');
    }

    logger.info('tierCheck: Validating tier access', {
      userId,
      requiredTier,
      endpoint: req.path,
      method: req.method,
    });

    // Fetch user record from PocketBase
    const user = await pb.collection('users').getOne(userId);

    // Check subscription status
    const subscriptionStatus = user.subscription_status || 'inactive';
    const isActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

    if (!isActiveSubscription) {
      logger.warn('tierCheck: Access denied - inactive subscription', {
        userId,
        subscriptionStatus,
        requiredTier,
        endpoint: req.path,
      });
      return res.status(403).json({
        error: `Feature requires ${requiredTier} subscription`,
        reason: 'subscription_inactive',
        currentStatus: subscriptionStatus,
      });
    }

    // Check subscription tier
    const userTier = (user.subscription_tier || '').toUpperCase();
    const normalizedRequiredTier = requiredTier.toUpperCase();

    // Tier hierarchy: ARCHMAGE > SCRIBE
    const tierHierarchy = {
      ARCHMAGE: 2,
      SCRIBE: 1,
    };

    const userTierLevel = tierHierarchy[userTier] || 0;
    const requiredTierLevel = tierHierarchy[normalizedRequiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      logger.warn('tierCheck: Access denied - insufficient tier', {
        userId,
        userTier,
        requiredTier: normalizedRequiredTier,
        endpoint: req.path,
      });
      return res.status(403).json({
        error: `Feature requires ${normalizedRequiredTier} subscription`,
        reason: 'insufficient_tier',
        userTier,
        requiredTier: normalizedRequiredTier,
      });
    }

    logger.info('tierCheck: Access granted', {
      userId,
      userTier,
      requiredTier: normalizedRequiredTier,
      endpoint: req.path,
    });

    // Access granted, proceed to next middleware/handler
    next();
  };
}

export default tierCheck;