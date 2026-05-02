import express from 'express';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

/**
 * Check if a price ID is a placeholder
 */
function isPlaceholder(priceId) {
  if (!priceId) return true;
  // Check for placeholder patterns like price_1THyVPGYtGe4J9IiXXXXXXXX
  return /XXXX|YYYY|placeholder|undefined|null/i.test(priceId);
}

/**
 * Find a product by name
 */
async function findProductByName(name) {
  const products = await stripe.products.list({ limit: 100 });
  return products.data.find((p) => p.name === name);
}

/**
 * Find all prices for a product
 */
async function findPricesForProduct(productId) {
  const prices = await stripe.prices.list({
    product: productId,
    limit: 100,
  });
  return prices.data;
}

/**
 * POST /stripe-setup-fix/full-reset
 * Complete Stripe setup fix: verify, clean up, create fresh products and prices
 */
router.post('/full-reset', async (req, res) => {
  logger.info('🚀 Starting comprehensive Stripe setup fix...');
  logger.info('\n' + '='.repeat(80));

  // STEP 1: Check current .env values
  logger.info('\n📋 STEP 1: Checking current .env values...');
  logger.info('-'.repeat(80));

  const { envObj } = readEnvFile();
  const currentScribePriceId = envObj.STRIPE_PRICE_ID_SCRIBE;
  const currentArchmagePriceId = envObj.STRIPE_PRICE_ID_ARCHMAGE;

  logger.info(`Current STRIPE_PRICE_ID_SCRIBE: ${currentScribePriceId || '(empty)'}`);
  logger.info(`Current STRIPE_PRICE_ID_ARCHMAGE: ${currentArchmagePriceId || '(empty)'}`);

  const scribeIsPlaceholder = isPlaceholder(currentScribePriceId);
  const archmageIsPlaceholder = isPlaceholder(currentArchmagePriceId);

  if (scribeIsPlaceholder) {
    logger.warn('⚠️  STRIPE_PRICE_ID_SCRIBE is a placeholder or empty - will create new');
  }
  if (archmageIsPlaceholder) {
    logger.warn('⚠️  STRIPE_PRICE_ID_ARCHMAGE is a placeholder or empty - will create new');
  }

  // STEP 2: Check for existing products
  logger.info('\n🔍 STEP 2: Checking for existing Stripe products...');
  logger.info('-'.repeat(80));

  let existingScribeProduct = await findProductByName('Scribe');
  let existingArchmageProduct = await findProductByName('Archmage');

  if (existingScribeProduct) {
    logger.info(`Found existing Scribe product: ${existingScribeProduct.id}`);
    const scribePrices = await findPricesForProduct(existingScribeProduct.id);
    const activePrices = scribePrices.filter((p) => p.active);
    logger.info(`  Total prices: ${scribePrices.length}, Active: ${activePrices.length}`);

    if (activePrices.length === 0) {
      logger.warn('  ⚠️  No active prices found - will delete and recreate');
      existingScribeProduct = null;
    }
  } else {
    logger.info('No existing Scribe product found');
  }

  if (existingArchmageProduct) {
    logger.info(`Found existing Archmage product: ${existingArchmageProduct.id}`);
    const archmageprices = await findPricesForProduct(existingArchmageProduct.id);
    const activePrices = archmageprices.filter((p) => p.active);
    logger.info(`  Total prices: ${archmageprices.length}, Active: ${activePrices.length}`);

    if (activePrices.length === 0) {
      logger.warn('  ⚠️  No active prices found - will delete and recreate');
      existingArchmageProduct = null;
    }
  } else {
    logger.info('No existing Archmage product found');
  }

  // STEP 3: Delete old products if needed
  logger.info('\n🗑️  STEP 3: Cleaning up old products...');
  logger.info('-'.repeat(80));

  if (existingScribeProduct) {
    logger.info(`Deleting old Scribe product: ${existingScribeProduct.id}`);
    await stripe.products.del(existingScribeProduct.id);
    logger.info(`✅ Deleted Scribe product: ${existingScribeProduct.id}`);
    existingScribeProduct = null;
  } else {
    logger.info('No Scribe product to delete');
  }

  if (existingArchmageProduct) {
    logger.info(`Deleting old Archmage product: ${existingArchmageProduct.id}`);
    await stripe.products.del(existingArchmageProduct.id);
    logger.info(`✅ Deleted Archmage product: ${existingArchmageProduct.id}`);
    existingArchmageProduct = null;
  } else {
    logger.info('No Archmage product to delete');
  }

  // STEP 4: Create fresh products
  logger.info('\n📦 STEP 4: Creating fresh Stripe products...');
  logger.info('-'.repeat(80));

  logger.info('Creating Scribe product...');
  const scribeProduct = await stripe.products.create({
    name: 'Scribe',
    description: 'For the author who shows up every day',
    metadata: {
      tierId: 'scribe',
    },
  });
  logger.info(`✅ Created Scribe product: ${scribeProduct.id}`);
  logger.info(`   Description: ${scribeProduct.description}`);

  logger.info('\nCreating Archmage product...');
  const archmageProduct = await stripe.products.create({
    name: 'Archmage',
    description: 'No limits. No credits. Just you, quill, and the story',
    metadata: {
      tierId: 'archmage',
    },
  });
  logger.info(`✅ Created Archmage product: ${archmageProduct.id}`);
  logger.info(`   Description: ${archmageProduct.description}`);

  // STEP 5: Create fresh prices
  logger.info('\n💰 STEP 5: Creating fresh Stripe prices...');
  logger.info('-'.repeat(80));

  logger.info('Creating Scribe price: $27.00 USD/month...');
  const scribePrice = await stripe.prices.create({
    product: scribeProduct.id,
    unit_amount: 2700, // $27.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      tierId: 'scribe',
    },
  });
  logger.info(`✅ Created Scribe price: ${scribePrice.id}`);
  logger.info(`   Amount: $${(scribePrice.unit_amount / 100).toFixed(2)}/month`);
  logger.info(`   Status: ${scribePrice.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);

  logger.info('\nCreating Archmage price: $197.00 USD/year...');
  const archmagePrice = await stripe.prices.create({
    product: archmageProduct.id,
    unit_amount: 19700, // $197.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'year',
    },
    metadata: {
      tierId: 'archmage',
    },
  });
  logger.info(`✅ Created Archmage price: ${archmagePrice.id}`);
  logger.info(`   Amount: $${(archmagePrice.unit_amount / 100).toFixed(2)}/year`);
  logger.info(`   Status: ${archmagePrice.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);

  // STEP 6: Verify prices are active
  logger.info('\n✔️  STEP 6: Verifying prices are active...');
  logger.info('-'.repeat(80));

  const verifyScribePrice = await stripe.prices.retrieve(scribePrice.id);
  if (!verifyScribePrice.active) {
    throw new Error(`Scribe price ${scribePrice.id} is not active!`);
  }
  logger.info(`✅ Scribe price verified: ${verifyScribePrice.id}`);
  logger.info(`   Amount: $${(verifyScribePrice.unit_amount / 100).toFixed(2)}/${verifyScribePrice.recurring.interval}`);
  logger.info(`   Status: ACTIVE ✅`);

  const verifyArchmagePrice = await stripe.prices.retrieve(archmagePrice.id);
  if (!verifyArchmagePrice.active) {
    throw new Error(`Archmage price ${archmagePrice.id} is not active!`);
  }
  logger.info(`✅ Archmage price verified: ${verifyArchmagePrice.id}`);
  logger.info(`   Amount: $${(verifyArchmagePrice.unit_amount / 100).toFixed(2)}/${verifyArchmagePrice.recurring.interval}`);
  logger.info(`   Status: ACTIVE ✅`);

  // STEP 7: Update .env file
  logger.info('\n📝 STEP 7: Updating .env file...');
  logger.info('-'.repeat(80));

  const { envObj: envToUpdate, lines } = readEnvFile();
  envToUpdate.STRIPE_PRICE_ID_SCRIBE = scribePrice.id;
  envToUpdate.STRIPE_PRICE_ID_ARCHMAGE = archmagePrice.id;
  updateEnvFile(envToUpdate, lines);
  logger.info('✅ .env file updated successfully');

  // STEP 8: Verify .env update
  logger.info('\n🔍 STEP 8: Verifying .env file...');
  logger.info('-'.repeat(80));

  const { envObj: verifyEnv } = readEnvFile();
  const verifyScribeId = verifyEnv.STRIPE_PRICE_ID_SCRIBE;
  const verifyArchmageId = verifyEnv.STRIPE_PRICE_ID_ARCHMAGE;

  if (verifyScribeId !== scribePrice.id) {
    throw new Error(`Failed to verify STRIPE_PRICE_ID_SCRIBE in .env. Expected ${scribePrice.id}, got ${verifyScribeId}`);
  }
  logger.info(`✅ STRIPE_PRICE_ID_SCRIBE verified in .env: ${verifyScribeId}`);

  if (verifyArchmageId !== archmagePrice.id) {
    throw new Error(`Failed to verify STRIPE_PRICE_ID_ARCHMAGE in .env. Expected ${archmagePrice.id}, got ${verifyArchmageId}`);
  }
  logger.info(`✅ STRIPE_PRICE_ID_ARCHMAGE verified in .env: ${verifyArchmageId}`);

  // STEP 9: Final verification - retrieve from Stripe
  logger.info('\n🎯 STEP 9: Final verification - retrieving from Stripe...');
  logger.info('-'.repeat(80));

  const finalScribePrice = await stripe.prices.retrieve(scribePrice.id);
  const finalArchmagePrice = await stripe.prices.retrieve(archmagePrice.id);

  logger.info('✅ Scribe price retrieved from Stripe:');
  logger.info(`   ID: ${finalScribePrice.id}`);
  logger.info(`   Amount: $${(finalScribePrice.unit_amount / 100).toFixed(2)}/${finalScribePrice.recurring.interval}`);
  logger.info(`   Status: ${finalScribePrice.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
  logger.info(`   Product: ${finalScribePrice.product}`);

  logger.info('\n✅ Archmage price retrieved from Stripe:');
  logger.info(`   ID: ${finalArchmagePrice.id}`);
  logger.info(`   Amount: $${(finalArchmagePrice.unit_amount / 100).toFixed(2)}/${finalArchmagePrice.recurring.interval}`);
  logger.info(`   Status: ${finalArchmagePrice.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
  logger.info(`   Product: ${finalArchmagePrice.product}`);

  // Final summary
  logger.info('\n' + '='.repeat(80));
  logger.info('🎉 STRIPE SETUP FIX COMPLETED SUCCESSFULLY');
  logger.info('='.repeat(80));
  logger.info('\n📊 Created Products:');
  logger.info(`  • Scribe: ${scribeProduct.id}`);
  logger.info(`    Description: ${scribeProduct.description}`);
  logger.info(`  • Archmage: ${archmageProduct.id}`);
  logger.info(`    Description: ${archmageProduct.description}`);
  logger.info('\n💰 Created Prices:');
  logger.info(`  • Scribe: ${scribePrice.id} ($27.00/month) - ACTIVE ✅`);
  logger.info(`  • Archmage: ${archmagePrice.id} ($197.00/year) - ACTIVE ✅`);
  logger.info('\n✨ Environment Variables Updated:');
  logger.info(`  STRIPE_PRICE_ID_SCRIBE=${scribePrice.id}`);
  logger.info(`  STRIPE_PRICE_ID_ARCHMAGE=${archmagePrice.id}`);
  logger.info('\n' + '='.repeat(80));

  res.json({
    success: true,
    message: 'Stripe setup fix completed successfully',
    products: {
      scribe: {
        id: scribeProduct.id,
        name: scribeProduct.name,
        description: scribeProduct.description,
      },
      archmage: {
        id: archmageProduct.id,
        name: archmageProduct.name,
        description: archmageProduct.description,
      },
    },
    prices: {
      scribe: {
        id: scribePrice.id,
        amount: scribePrice.unit_amount,
        currency: scribePrice.currency,
        interval: scribePrice.recurring.interval,
        active: scribePrice.active,
      },
      archmage: {
        id: archmagePrice.id,
        amount: archmagePrice.unit_amount,
        currency: archmagePrice.currency,
        interval: archmagePrice.recurring.interval,
        active: archmagePrice.active,
      },
    },
    verification: {
      scribeVerified: finalScribePrice.active && finalScribePrice.id === scribePrice.id,
      archmageVerified: finalArchmagePrice.active && finalArchmagePrice.id === archmagePrice.id,
    },
  });
});

export default router;