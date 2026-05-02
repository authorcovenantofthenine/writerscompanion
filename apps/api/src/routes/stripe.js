import express from 'express';
import stripe from '../utils/stripeClient.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Middleware to verify authentication
const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.id) {
    return res.status(401).json({ error: 'Unauthorized - authentication required' });
  }
  next();
};

// GET /stripe/prices - PUBLIC endpoint
// Retrieves all active prices for Scribe and Archmage products
router.get('/prices', async (req, res) => {
  logger.info('Fetching active Stripe prices...');

  // Retrieve all active prices from Stripe
  const pricesResponse = await stripe.prices.list({
    active: true,
    limit: 100,
  });

  logger.info(`Retrieved ${pricesResponse.data.length} active prices from Stripe`);

  // Get price IDs from environment
  const scribePriceId = process.env.STRIPE_PRICE_ID_SCRIBE;
  const archmagepriceId = process.env.STRIPE_PRICE_ID_ARCHMAGE;

  if (!scribePriceId || !archmagepriceId) {
    throw new Error('Missing Stripe price IDs in environment variables (STRIPE_PRICE_ID_SCRIBE or STRIPE_PRICE_ID_ARCHMAGE)');
  }

  logger.info('Environment price IDs', {
    scribePriceId,
    archmagepriceId,
  });

  // Filter for Scribe and Archmage prices
  const relevantPrices = pricesResponse.data.filter(
    (price) => price.id === scribePriceId || price.id === archmagepriceId
  );

  logger.info(`Filtered to ${relevantPrices.length} relevant prices (Scribe and Archmage)`);

  if (relevantPrices.length === 0) {
    throw new Error('No active prices found for Scribe and Archmage products in Stripe');
  }

  // Retrieve product details for each price
  const pricesWithProductInfo = await Promise.all(
    relevantPrices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product);

      return {
        id: price.id,
        productId: price.product,
        productName: product.name,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval || null,
        status: price.active ? 'active' : 'inactive',
      };
    })
  );

  logger.info('Prices with product info retrieved successfully', {
    count: pricesWithProductInfo.length,
    prices: pricesWithProductInfo.map((p) => ({
      id: p.id,
      productName: p.productName,
      amount: p.amount,
      interval: p.interval,
      status: p.status,
    })),
  });

  res.json({
    prices: pricesWithProductInfo,
  });
});

// POST /stripe/create-checkout - PUBLIC endpoint
// Creates a Checkout Session for subscription
router.post('/create-checkout', async (req, res) => {
  const { amount, productName, successUrl, cancelUrl } = req.body;

  if (!amount || !productName || !successUrl || !cancelUrl) {
    return res.status(400).json({
      error: 'amount, productName, successUrl, and cancelUrl are required',
    });
  }

  logger.info('Creating checkout session', {
    amount,
    productName,
    successUrl,
    cancelUrl,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
          },
          unit_amount: amount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  logger.info('Checkout session created', {
    sessionId: session.id,
    amount,
    productName,
    url: session.url,
  });

  res.json({ url: session.url });
});

// GET /stripe/session/:sessionId - PUBLIC endpoint
// Retrieves checkout session details
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  logger.info('Retrieving checkout session', { sessionId });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  logger.info('Checkout session retrieved', {
    sessionId: session.id,
    status: session.payment_status,
    tier: session.metadata?.tier,
  });

  res.json({
    id: session.id,
    status: session.payment_status,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email,
    customerId: session.customer,
  });
});

// POST /stripe/create-subscription - REQUIRES AUTHENTICATION
router.post('/create-subscription', async (req, res) => {
  const { tier, userId, successUrl, cancelUrl } = req.body;

  // Validate required parameters
  if (!tier) {
    return res.status(400).json({ error: 'tier is required' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!successUrl) {
    return res.status(400).json({ error: 'successUrl is required' });
  }
  if (!cancelUrl) {
    return res.status(400).json({ error: 'cancelUrl is required' });
  }

  // Validate tier
  if (tier !== 'scribe' && tier !== 'archmage') {
    throw new Error('Invalid tier. Must be scribe or archmage');
  }

  // Get price ID from environment
  const priceId = tier === 'scribe' ? process.env.STRIPE_PRICE_ID_SCRIBE : process.env.STRIPE_PRICE_ID_ARCHMAGE;

  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }

  logger.info('Creating subscription checkout session', {
    userId,
    tier,
    priceId,
  });

  // Get user from PocketBase
  const user = await pb.collection('users').getOne(userId);

  let stripeCustomerId = user.stripe_customer_id;

  // Create or retrieve Stripe customer
  if (!stripeCustomerId) {
    logger.info('Creating new Stripe customer', { userId, email: user.email });

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || user.email,
      metadata: {
        userId,
      },
    });

    stripeCustomerId = customer.id;
    logger.info('Stripe customer created', { customerId: stripeCustomerId, userId });

    // Update user with stripe_customer_id
    await pb.collection('users').update(userId, {
      stripe_customer_id: stripeCustomerId,
    });
    logger.info('User updated with stripe_customer_id', { userId, stripeCustomerId });
  } else {
    logger.info('Using existing Stripe customer', { stripeCustomerId, userId });
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      tier,
      userId,
    },
  });

  logger.info('Checkout session created', {
    sessionId: session.id,
    userId,
    tier,
    stripeCustomerId,
  });

  res.json({ url: session.url });
});

// GET /stripe/subscription-status - REQUIRES AUTHENTICATION
router.get('/subscription-status', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  logger.info('Fetching subscription status', { userId });

  // Get user from PocketBase
  const user = await pb.collection('users').getOne(userId);

  logger.info('User subscription status retrieved', {
    userId,
    subscription_status: user.subscription_status || 'inactive',
    subscription_plan: user.subscription_plan || null,
  });

  res.json({
    subscription_status: user.subscription_status || 'inactive',
    subscription_plan: user.subscription_plan || null,
    subscription_current_period_end: user.subscription_current_period_end || null,
  });
});

// POST /stripe/manage-subscription - REQUIRES AUTHENTICATION
router.post('/manage-subscription', requireAuth, async (req, res) => {
  const userId = req.auth.id;

  logger.info('Creating billing portal session', { userId });

  // Get user from PocketBase
  const user = await pb.collection('users').getOne(userId);

  if (!user.stripe_customer_id) {
    throw new Error('No active subscription found');
  }

  // Create billing portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: 'http://localhost:5173/subscription',
  });

  logger.info('Billing portal session created', {
    sessionId: session.id,
    userId,
    stripeCustomerId: user.stripe_customer_id,
  });

  res.json({ url: session.url });
});

export default router;