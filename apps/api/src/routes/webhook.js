import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /webhook - Stripe webhook handler
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not configured');
  }

  if (!sig) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.warn(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  logger.info('Webhook event received', {
    eventType: event.type,
    eventId: event.id,
    timestamp: new Date(event.created * 1000).toISOString(),
  });

  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      logger.info('checkout.session.completed event processed', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
      });
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      logger.info('invoice.paid event processed', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      logger.warn('invoice.payment_failed event processed', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        failureMessage: invoice.failure_message,
      });
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;
      logger.info('customer.subscription.created event processed', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      logger.info('customer.subscription.updated event processed', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      logger.info('customer.subscription.deleted event processed', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
      });
      break;
    }

    default:
      logger.info(`Unhandled webhook event type: ${event.type}`, {
        eventId: event.id,
      });
  }

  res.status(200).json({ received: true });
});

// Handle non-POST requests
router.all('/', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;