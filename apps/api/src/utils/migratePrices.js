import 'dotenv/config';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

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

async function migratePrices() {
  logger.info('🚀 Starting Stripe price migration...');
  logger.info('\n' + '='.repeat(70));

  // Step 1: Find and archive old prices
  logger.info('\n📋 STEP 1: Finding and archiving old prices...');
  logger.info('-'.repeat(70));

  const allPrices = await stripe.prices.list({
    limit: 100,
  });

  const oldScribePrice = allPrices.data.find(
    (price) => price.unit_amount === 999 && price.metadata?.tierId === 'scribe'
  );
  const oldArchmagePrice = allPrices.data.find(
    (price) => price.unit_amount === 2999 && price.metadata?.tierId === 'archmage'
  );

  if (oldScribePrice) {
    logger.info(`Found old Scribe price: ${oldScribePrice.id} ($9.99/month)`);
    await stripe.prices.update(oldScribePrice.id, { active: false });
    logger.info(`✅ Archived old Scribe price: ${oldScribePrice.id}`);
  } else {
    logger.warn('⚠️  Old Scribe price ($9.99/month) not found');
  }

  if (oldArchmagePrice) {
    logger.info(`Found old Archmage price: ${oldArchmagePrice.id} ($29.99/month)`);
    await stripe.prices.update(oldArchmagePrice.id, { active: false });
    logger.info(`✅ Archived old Archmage price: ${oldArchmagePrice.id}`);
  } else {
    logger.warn('⚠️  Old Archmage price ($29.99/month) not found');
  }

  // Step 2: Get product IDs from current environment
  logger.info('\n📦 STEP 2: Retrieving product IDs...');
  logger.info('-'.repeat(70));

  const { envObj } = readEnvFile();
  const currentScribePriceId = envObj.STRIPE_PRICE_ID_SCRIBE;
  const currentArchmagePriceId = envObj.STRIPE_PRICE_ID_ARCHMAGE;

  let scribeProductId = null;
  let archmageProductId = null;

  if (currentScribePriceId) {
    const scribePrice = await stripe.prices.retrieve(currentScribePriceId);
    scribeProductId = scribePrice.product;
    logger.info(`✅ Scribe product ID: ${scribeProductId}`);
  } else {
    throw new Error('STRIPE_PRICE_ID_SCRIBE not found in .env');
  }

  if (currentArchmagePriceId) {
    const archmagePrice = await stripe.prices.retrieve(currentArchmagePriceId);
    archmageProductId = archmagePrice.product;
    logger.info(`✅ Archmage product ID: ${archmageProductId}`);
  } else {
    throw new Error('STRIPE_PRICE_ID_ARCHMAGE not found in .env');
  }

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
  logger.info('\n✔️  STEP 5: Verifying .env file...');
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
  logger.info('\n📊 Migration Summary:');
  logger.info('\n  OLD PRICES (Archived):');
  if (oldScribePrice) {
    logger.info(`    • Scribe: ${oldScribePrice.id} ($9.99/month)`);
  }
  if (oldArchmagePrice) {
    logger.info(`    • Archmage: ${oldArchmagePrice.id} ($29.99/month)`);
  }
  logger.info('\n  NEW PRICES (Active):');
  logger.info(`    • Scribe: ${newScribePrice.id} ($27.00/month)`);
  logger.info(`    • Archmage: ${newArchmagePrice.id} ($197.00/year)`);
  logger.info('\n  ENVIRONMENT VARIABLES UPDATED:');
  logger.info(`    STRIPE_PRICE_ID_SCRIBE=${newScribePrice.id}`);
  logger.info(`    STRIPE_PRICE_ID_ARCHMAGE=${newArchmagePrice.id}`);
  logger.info('\n' + '='.repeat(70));

  return {
    oldPrices: {
      scribe: oldScribePrice?.id || null,
      archmage: oldArchmagePrice?.id || null,
    },
    newPrices: {
      scribe: newScribePrice.id,
      archmage: newArchmagePrice.id,
    },
  };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePrices()
    .then((result) => {
      logger.info('\n✨ Migration script completed successfully!');
      logger.info('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      logger.error('\n❌ Migration failed:', error.message);
      logger.error('Stack:', error.stack);
      process.exit(1);
    });
}

export default migratePrices;