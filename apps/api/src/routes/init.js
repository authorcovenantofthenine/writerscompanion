import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import stripe from '../utils/stripeClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file
const envPath = path.join(__dirname, '../../.env');

/**
 * Read .env file and parse it into an object
 */
function readEnvFile() {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envObj = {};
  const lines = envContent.split('\n');

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key) {
        envObj[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return { envObj, lines };
}

/**
 * Update .env file with new values
 */
function updateEnvFile(envObj, lines) {
  const updatedLines = [];
  const processedKeys = new Set();

  // Process existing lines
  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      updatedLines.push(line);
      return;
    }

    const [key] = trimmedLine.split('=');
    const trimmedKey = key.trim();

    if (envObj[trimmedKey] !== undefined) {
      updatedLines.push(`${trimmedKey}=${envObj[trimmedKey]}`);
      processedKeys.add(trimmedKey);
    } else {
      updatedLines.push(line);
    }
  });

  // Add any new keys that weren't in the original file
  Object.entries(envObj).forEach(([key, value]) => {
    if (!processedKeys.has(key)) {
      updatedLines.push(`${key}=${value}`);
    }
  });

  const updatedContent = updatedLines.join('\n');
  fs.writeFileSync(envPath, updatedContent, 'utf-8');
}

// POST /init/setup-stripe
router.post('/setup-stripe', async (req, res) => {
  logger.info('🚀 Starting Stripe setup endpoint...');

  // Check if STRIPE_SECRET_KEY exists
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  // Read current .env file to check if already initialized
  const { envObj } = readEnvFile();

  // Check if both price IDs already exist
  if (envObj.STRIPE_PRICE_ID_SCRIBE && envObj.STRIPE_PRICE_ID_ARCHMAGE) {
    logger.warn('Stripe products already initialized');
    return res.status(409).json({
      success: false,
      message: 'Stripe products already initialized',
    });
  }

  logger.info('Creating Scribe product...');
  const scribeProduct = await stripe.products.create({
    name: 'Scribe',
    description: 'Scribe subscription tier',
    metadata: {
      tierId: 'scribe',
    },
  });
  logger.info(`✅ Created Scribe product: ${scribeProduct.id}`);

  logger.info('Creating Scribe price ($9.99/month)...');
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

  logger.info('Creating Archmage product...');
  const archmageProduct = await stripe.products.create({
    name: 'Archmage',
    description: 'Archmage subscription tier',
    metadata: {
      tierId: 'archmage',
    },
  });
  logger.info(`✅ Created Archmage product: ${archmageProduct.id}`);

  logger.info('Creating Archmage price ($29.99/month)...');
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

  // Update .env file with new price IDs
  logger.info('📝 Updating .env file...');
  const { lines } = readEnvFile();
  envObj.STRIPE_PRICE_ID_SCRIBE = scribePrice.id;
  envObj.STRIPE_PRICE_ID_ARCHMAGE = archmagePrice.id;
  updateEnvFile(envObj, lines);
  logger.info('✅ .env file updated successfully');

  logger.info('\n' + '='.repeat(60));
  logger.info('🎉 STRIPE SETUP COMPLETE');
  logger.info('='.repeat(60));
  logger.info(`\n📊 Created Products:`);
  logger.info(`  • Scribe (${scribeProduct.id})`);
  logger.info(`  • Archmage (${archmageProduct.id})`);
  logger.info(`\n💰 Created Prices:`);
  logger.info(`  • Scribe: $9.99/month (${scribePrice.id})`);
  logger.info(`  • Archmage: $29.99/month (${archmagePrice.id})`);
  logger.info(`\n✨ Environment Variables Updated:`);
  logger.info(`  STRIPE_PRICE_ID_SCRIBE=${scribePrice.id}`);
  logger.info(`  STRIPE_PRICE_ID_ARCHMAGE=${archmagePrice.id}`);
  logger.info('\n' + '='.repeat(60));

  res.json({
    success: true,
    scribePriceId: scribePrice.id,
    archmagePrice: archmagePrice.id,
    message: 'Stripe products created successfully',
  });
});

// POST /init/migrate-prices
router.post('/migrate-prices', async (req, res) => {
  logger.info('🚀 Starting Stripe price migration endpoint...');
  logger.info('\n' + '='.repeat(70));

  // Check if STRIPE_SECRET_KEY exists
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  // Read current .env file
  const { envObj } = readEnvFile();

  // Check if migration already completed
  const currentScribePriceId = envObj.STRIPE_PRICE_ID_SCRIBE;
  const currentArchmagePriceId = envObj.STRIPE_PRICE_ID_ARCHMAGE;

  if (!currentScribePriceId || !currentArchmagePriceId) {
    throw new Error('Current price IDs not found in .env - run /init/setup-stripe first');
  }

  // Verify current prices are not already the new prices
  // New Scribe price should be 2700 cents, new Archmage should be 19700 cents
  const currentScribePrice = await stripe.prices.retrieve(currentScribePriceId);
  const currentArchmagePrice = await stripe.prices.retrieve(currentArchmagePriceId);

  if (currentScribePrice.unit_amount === 2700 && currentArchmagePrice.unit_amount === 19700) {
    throw new Error('Migration already completed');
  }

  // Step 1: Get product IDs from current prices
  logger.info('\n📦 STEP 1: Retrieving product IDs...');
  logger.info('-'.repeat(70));

  const scribeProductId = currentScribePrice.product;
  const archmageProductId = currentArchmagePrice.product;

  logger.info(`✅ Scribe product ID: ${scribeProductId}`);
  logger.info(`✅ Archmage product ID: ${archmageProductId}`);

  // Step 2: Find and archive old prices
  logger.info('\n🔍 STEP 2: Finding and archiving old prices...');
  logger.info('-'.repeat(70));

  // Archive old Scribe price (999 cents = $9.99/month)
  logger.info(`Archiving old Scribe price: ${currentScribePriceId} ($9.99/month)`);
  await stripe.prices.update(currentScribePriceId, { active: false });
  logger.info(`✅ Archived old Scribe price: ${currentScribePriceId}`);

  // Archive old Archmage price (2999 cents = $29.99/month)
  logger.info(`Archiving old Archmage price: ${currentArchmagePriceId} ($29.99/month)`);
  await stripe.prices.update(currentArchmagePriceId, { active: false });
  logger.info(`✅ Archived old Archmage price: ${currentArchmagePriceId}`);

  // Step 3: Create new prices
  logger.info('\n💰 STEP 3: Creating new prices...');
  logger.info('-'.repeat(70));

  logger.info('Creating new Scribe price: $27.00/month (2700 cents)...');
  const newScribePrice = await stripe.prices.create({
    product: scribeProductId,
    unit_amount: 2700, // $27.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      tierId: 'scribe',
    },
  });
  logger.info(`✅ Created new Scribe price: ${newScribePrice.id}`);
  logger.info(`   Amount: $${(newScribePrice.unit_amount / 100).toFixed(2)}/month`);

  logger.info('\nCreating new Archmage price: $197.00/year (19700 cents)...');
  const newArchmagePrice = await stripe.prices.create({
    product: archmageProductId,
    unit_amount: 19700, // $197.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'year',
    },
    metadata: {
      tierId: 'archmage',
    },
  });
  logger.info(`✅ Created new Archmage price: ${newArchmagePrice.id}`);
  logger.info(`   Amount: $${(newArchmagePrice.unit_amount / 100).toFixed(2)}/year`);

  // Step 4: Update .env file
  logger.info('\n📝 STEP 4: Updating .env file...');
  logger.info('-'.repeat(70));

  const { lines } = readEnvFile();
  envObj.STRIPE_PRICE_ID_SCRIBE = newScribePrice.id;
  envObj.STRIPE_PRICE_ID_ARCHMAGE = newArchmagePrice.id;
  updateEnvFile(envObj, lines);
  logger.info('✅ .env file updated successfully');

  // Step 5: Verify the update
  logger.info('\n✔️ STEP 5: Verifying .env file...');
  logger.info('-'.repeat(70));

  const { envObj: verifyEnv } = readEnvFile();
  const verifyScribeId = verifyEnv.STRIPE_PRICE_ID_SCRIBE;
  const verifyArchmageId = verifyEnv.STRIPE_PRICE_ID_ARCHMAGE;

  if (verifyScribeId === newScribePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_SCRIBE verified: ${verifyScribeId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_SCRIBE in .env');
  }

  if (verifyArchmageId === newArchmagePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_ARCHMAGE verified: ${verifyArchmageId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_ARCHMAGE in .env');
  }

  // Final summary
  logger.info('\n' + '='.repeat(70));
  logger.info('🎉 STRIPE PRICE MIGRATION COMPLETED SUCCESSFULLY');
  logger.info('='.repeat(70));
  logger.info('\n📋 Migration Summary:');
  logger.info('\n  OLD PRICES (Archived):');
  logger.info(`    • Scribe: ${currentScribePriceId} ($9.99/month)`);
  logger.info(`    • Archmage: ${currentArchmagePriceId} ($29.99/month)`);
  logger.info('\n  NEW PRICES (Active):');
  logger.info(`    • Scribe: ${newScribePrice.id} ($27.00/month)`);
  logger.info(`    • Archmage: ${newArchmagePrice.id} ($197.00/year)`);
  logger.info('\n  ENVIRONMENT VARIABLES UPDATED:');
  logger.info(`    STRIPE_PRICE_ID_SCRIBE=${newScribePrice.id}`);
  logger.info(`    STRIPE_PRICE_ID_ARCHMAGE=${newArchmagePrice.id}`);
  logger.info('\n' + '='.repeat(70));

  res.json({
    success: true,
    scribePriceId: newScribePrice.id,
    archmagePrice: newArchmagePrice.id,
    message: 'Prices migrated successfully',
  });
});

export default router;