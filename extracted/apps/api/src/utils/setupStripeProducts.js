import 'dotenv/config';
import Stripe from 'stripe';
import logger from './logger.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  logger.info('🚀 Starting Stripe products setup...');

  // Create Scribe product
  const scribeProduct = await stripe.products.create({
    name: 'Scribe',
    description: 'Scribe subscription tier',
    metadata: {
      tierId: 'scribe',
    },
  });

  logger.info(`✅ Created Scribe product: ${scribeProduct.id}`);

  // Create Scribe price ($9.99/month)
  const scribePrice = await stripe.prices.create({
    product: scribeProduct.id,
    unit_amount: 999, // $9.99 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      tierId: 'scribe',
    },
  });

  logger.info(`✅ Created Scribe price: ${scribePrice.id}`);

  // Create Archmage product
  const archmageProduct = await stripe.products.create({
    name: 'Archmage',
    description: 'Archmage subscription tier',
    metadata: {
      tierId: 'archmage',
    },
  });

  logger.info(`✅ Created Archmage product: ${archmageProduct.id}`);

  // Create Archmage price ($29.99/month)
  const archmagePrice = await stripe.prices.create({
    product: archmageProduct.id,
    unit_amount: 2999, // $29.99 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      tierId: 'archmage',
    },
  });

  logger.info(`✅ Created Archmage price: ${archmagePrice.id}`);

  logger.info('\n' + '='.repeat(50));
  logger.info('🎉 STRIPE SETUP COMPLETE');
  logger.info('='.repeat(50));
  logger.info(`\n📌 Add these environment variables to apps/api/.env:\n`);
  logger.info(`STRIPE_PRICE_ID_SCRIBE=${scribePrice.id}`);
  logger.info(`STRIPE_PRICE_ID_ARCHMAGE=${archmagePrice.id}`);
  logger.info('\n' + '='.repeat(50));

  return {
    scribePrice: scribePrice.id,
    archmagePrice: archmagePrice.id,
    scribeProduct: scribeProduct.id,
    archmageProduct: archmageProduct.id,
  };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStripeProducts()
    .then((result) => {
      logger.info('\n✨ Setup completed successfully!');
      logger.info('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

export default setupStripeProducts;