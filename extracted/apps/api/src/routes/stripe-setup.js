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
 * Find a product by name
 */
async function findProductByName(name) {
  const products = await stripe.products.list({ limit: 100 });
  return products.data.find((p) => p.name === name);
}

/**
 * POST /stripe-setup/create-products
 * One-time setup endpoint to create Stripe products and prices
 * No authentication required
 */
router.post('/create-products', async (req, res) => {
  logger.info('🚀 Starting Stripe products and prices creation...');
  logger.info('\n' + '='.repeat(70));

  // Step 1: Create Products
  logger.info('\n📦 STEP 1: Creating Products...');
  logger.info('-'.repeat(70));

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

  // Step 2: Create Prices
  logger.info('\n💰 STEP 2: Creating Prices...');
  logger.info('-'.repeat(70));

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
  logger.info(`   Status: ${scribePrice.active ? 'active' : 'inactive'}`);

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
  logger.info(`   Status: ${archmagePrice.active ? 'active' : 'inactive'}`);

  // Step 3: Verify Prices
  logger.info('\n✔️  STEP 3: Verifying Prices...');
  logger.info('-'.repeat(70));

  const verifyScribePrice = await stripe.prices.retrieve(scribePrice.id);
  if (verifyScribePrice.id === scribePrice.id && verifyScribePrice.active) {
    logger.info(`✅ Scribe price verified: ${verifyScribePrice.id}`);
    logger.info(`   Amount: $${(verifyScribePrice.unit_amount / 100).toFixed(2)}/${verifyScribePrice.recurring.interval}`);
  } else {
    throw new Error(`Failed to verify Scribe price: ${scribePrice.id}`);
  }

  const verifyArchmagePrice = await stripe.prices.retrieve(archmagePrice.id);
  if (verifyArchmagePrice.id === archmagePrice.id && verifyArchmagePrice.active) {
    logger.info(`✅ Archmage price verified: ${verifyArchmagePrice.id}`);
    logger.info(`   Amount: $${(verifyArchmagePrice.unit_amount / 100).toFixed(2)}/${verifyArchmagePrice.recurring.interval}`);
  } else {
    throw new Error(`Failed to verify Archmage price: ${archmagePrice.id}`);
  }

  // Step 4: Update .env file
  logger.info('\n📝 STEP 4: Updating .env file...');
  logger.info('-'.repeat(70));

  const { envObj, lines } = readEnvFile();
  envObj.STRIPE_PRICE_ID_SCRIBE = scribePrice.id;
  envObj.STRIPE_PRICE_ID_ARCHMAGE = archmagePrice.id;
  updateEnvFile(envObj, lines);
  logger.info('✅ .env file updated successfully');

  // Step 5: Verify .env update
  logger.info('\n🔍 STEP 5: Verifying .env file...');
  logger.info('-'.repeat(70));

  const { envObj: verifyEnv } = readEnvFile();
  const verifyScribeId = verifyEnv.STRIPE_PRICE_ID_SCRIBE;
  const verifyArchmageId = verifyEnv.STRIPE_PRICE_ID_ARCHMAGE;

  if (verifyScribeId === scribePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_SCRIBE verified in .env: ${verifyScribeId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_SCRIBE in .env');
  }

  if (verifyArchmageId === archmagePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_ARCHMAGE verified in .env: ${verifyArchmageId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_ARCHMAGE in .env');
  }

  // Final summary
  logger.info('\n' + '='.repeat(70));
  logger.info('🎉 STRIPE PRODUCTS AND PRICES CREATED SUCCESSFULLY');
  logger.info('='.repeat(70));
  logger.info('\n📊 Created Products:');
  logger.info(`  • Scribe: ${scribeProduct.id}`);
  logger.info(`    Description: ${scribeProduct.description}`);
  logger.info(`  • Archmage: ${archmageProduct.id}`);
  logger.info(`    Description: ${archmageProduct.description}`);
  logger.info('\n💰 Created Prices:');
  logger.info(`  • Scribe: ${scribePrice.id} ($27.00/month)`);
  logger.info(`  • Archmage: ${archmagePrice.id} ($197.00/year)`);
  logger.info('\n✨ Environment Variables Updated:');
  logger.info(`  STRIPE_PRICE_ID_SCRIBE=${scribePrice.id}`);
  logger.info(`  STRIPE_PRICE_ID_ARCHMAGE=${archmagePrice.id}`);
  logger.info('\n' + '='.repeat(70));

  res.json({
    success: true,
    products: {
      scribe: {
        id: scribeProduct.id,
        name: scribeProduct.name,
      },
      archmage: {
        id: archmageProduct.id,
        name: archmageProduct.name,
      },
    },
    prices: {
      scribe: {
        id: scribePrice.id,
        amount: scribePrice.unit_amount,
        currency: scribePrice.currency,
        interval: scribePrice.recurring.interval,
      },
      archmage: {
        id: archmagePrice.id,
        amount: archmagePrice.unit_amount,
        currency: archmagePrice.currency,
        interval: archmagePrice.recurring.interval,
      },
    },
    message: 'Products and prices created successfully. .env updated.',
  });
});

/**
 * POST /stripe-setup/verify-and-create
 * Verify products exist, create if needed, create prices, update .env
 */
router.post('/verify-and-create', async (req, res) => {
  logger.info('🚀 Starting Stripe product and price verification/creation...');
  logger.info('\n' + '='.repeat(70));

  // Step 1: Verify/Create Products
  logger.info('\n📦 STEP 1: Verifying/Creating Products...');
  logger.info('-'.repeat(70));

  let scribeProduct = await findProductByName('Scribe');
  if (scribeProduct) {
    logger.info(`✅ Found existing Scribe product: ${scribeProduct.id}`);
  } else {
    logger.info('Creating new Scribe product...');
    scribeProduct = await stripe.products.create({
      name: 'Scribe',
      description: 'Monthly subscription',
      metadata: {
        tierId: 'scribe',
      },
    });
    logger.info(`✅ Created Scribe product: ${scribeProduct.id}`);
  }

  let archmageProduct = await findProductByName('Archmage');
  if (archmageProduct) {
    logger.info(`✅ Found existing Archmage product: ${archmageProduct.id}`);
  } else {
    logger.info('Creating new Archmage product...');
    archmageProduct = await stripe.products.create({
      name: 'Archmage',
      description: 'Yearly subscription',
      metadata: {
        tierId: 'archmage',
      },
    });
    logger.info(`✅ Created Archmage product: ${archmageProduct.id}`);
  }

  // Step 2: Create Prices
  logger.info('\n💰 STEP 2: Creating Prices...');
  logger.info('-'.repeat(70));

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
  logger.info(`   Status: ${scribePrice.active ? 'active' : 'inactive'}`);

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
  logger.info(`   Status: ${archmagePrice.active ? 'active' : 'inactive'}`);

  // Step 3: Verify Prices
  logger.info('\n✔️  STEP 3: Verifying Prices...');
  logger.info('-'.repeat(70));

  const verifyScribePrice = await stripe.prices.retrieve(scribePrice.id);
  if (verifyScribePrice.id === scribePrice.id && verifyScribePrice.active) {
    logger.info(`✅ Scribe price verified: ${verifyScribePrice.id}`);
    logger.info(`   Amount: $${(verifyScribePrice.unit_amount / 100).toFixed(2)}/${verifyScribePrice.recurring.interval}`);
  } else {
    throw new Error(`Failed to verify Scribe price: ${scribePrice.id}`);
  }

  const verifyArchmagePrice = await stripe.prices.retrieve(archmagePrice.id);
  if (verifyArchmagePrice.id === archmagePrice.id && verifyArchmagePrice.active) {
    logger.info(`✅ Archmage price verified: ${verifyArchmagePrice.id}`);
    logger.info(`   Amount: $${(verifyArchmagePrice.unit_amount / 100).toFixed(2)}/${verifyArchmagePrice.recurring.interval}`);
  } else {
    throw new Error(`Failed to verify Archmage price: ${archmagePrice.id}`);
  }

  // Step 4: Update .env file
  logger.info('\n📝 STEP 4: Updating .env file...');
  logger.info('-'.repeat(70));

  const { envObj, lines } = readEnvFile();
  envObj.STRIPE_PRICE_ID_SCRIBE = scribePrice.id;
  envObj.STRIPE_PRICE_ID_ARCHMAGE = archmagePrice.id;
  updateEnvFile(envObj, lines);
  logger.info('✅ .env file updated successfully');

  // Step 5: Verify .env update
  logger.info('\n🔍 STEP 5: Verifying .env file...');
  logger.info('-'.repeat(70));

  const { envObj: verifyEnv } = readEnvFile();
  const verifyScribeId = verifyEnv.STRIPE_PRICE_ID_SCRIBE;
  const verifyArchmageId = verifyEnv.STRIPE_PRICE_ID_ARCHMAGE;

  if (verifyScribeId === scribePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_SCRIBE verified in .env: ${verifyScribeId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_SCRIBE in .env');
  }

  if (verifyArchmageId === archmagePrice.id) {
    logger.info(`✅ STRIPE_PRICE_ID_ARCHMAGE verified in .env: ${verifyArchmageId}`);
  } else {
    throw new Error('Failed to verify STRIPE_PRICE_ID_ARCHMAGE in .env');
  }

  // Final summary
  logger.info('\n' + '='.repeat(70));
  logger.info('🎉 STRIPE SETUP COMPLETED SUCCESSFULLY');
  logger.info('='.repeat(70));
  logger.info('\n📊 Products:');
  logger.info(`  • Scribe: ${scribeProduct.id}`);
  logger.info(`  • Archmage: ${archmageProduct.id}`);
  logger.info('\n💰 Prices:');
  logger.info(`  • Scribe: ${scribePrice.id} ($27.00/month)`);
  logger.info(`  • Archmage: ${archmagePrice.id} ($197.00/year)`);
  logger.info('\n✨ Environment Variables Updated:');
  logger.info(`  STRIPE_PRICE_ID_SCRIBE=${scribePrice.id}`);
  logger.info(`  STRIPE_PRICE_ID_ARCHMAGE=${archmagePrice.id}`);
  logger.info('\n' + '='.repeat(70));

  res.json({
    success: true,
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
    message: 'Stripe products and prices verified/created successfully. .env file updated.',
  });
});

export default router;