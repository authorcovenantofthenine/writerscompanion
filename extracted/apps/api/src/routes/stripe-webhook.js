import express from 'express';
import Stripe from 'stripe';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to map Stripe price ID to subscription tier
function mapPriceToPlan(priceId) {
  const scribePriceId = process.env.STRIPE_PRICE_ID_SCRIBE;
  const archmagepriceId = process.env.STRIPE_PRICE_ID_ARCHMAGE;

  if (priceId === scribePriceId) {
    return 'scribe';
  }
  if (priceId === archmagepriceId) {
    return 'archmage';
  }
  return null;
}

// POST /webhook - Stripe webhook handler (PUBLIC, no auth required)
// CRITICAL: This route must receive raw body (Buffer), not parsed JSON
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not configured');
    }

    if (!sig) {
      throw new Error('Missing stripe-signature header');
    }

    // Verify webhook signature and construct event
    // stripe.webhooks.constructEvent will throw if signature is invalid
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    logger.info('Webhook event received and verified', {
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date(event.created * 1000).toISOString(),
    });

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      logger.info('Processing checkout.session.completed', {
        sessionId: session.id,
        customerId,
        subscriptionId,
      });

      if (!customerId) {
        logger.warn('checkout.session.completed: customer ID is missing');
        res.status(200).json({ received: true });
        return;
      }

      // Find user by stripe_customer_id
      const users = await pb.collection('users').getFullList({
        filter: `stripe_customer_id="${customerId}"`,
      });

      if (users.length > 0) {
        const user = users[0];

        // Retrieve subscription to get price and period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const subscriptionTier = mapPriceToPlan(priceId);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString().split('T')[0];

        // Update user with subscription details
        await pb.collection('users').update(user.id, {
          subscription_status: 'active',
          subscription_tier: subscriptionTier,
          stripe_subscription_id: subscriptionId,
          subscription_current_period_end: currentPeriodEnd,
        });

        logger.info('User subscription updated', {
          userId: user.id,
          subscriptionTier,
          subscriptionId,
          currentPeriodEnd,
        });
      } else {
        logger.warn('User not found for customer ID:', customerId);
      }
    } else {
      logger.info('Unhandled webhook event type', {
        eventType: event.type,
        eventId: event.id,
      });
    }

    res.status(200).json({ received: true });
  }
);

export default router;