import { Router } from 'express';
import healthCheck from './health-check.js';
import stripeRouter from './stripe.js';
import stripeWebhookRouter from './stripe-webhook.js';
import initRouter from './init.js';
import stripeSetupRouter from './stripe-setup.js';
import stripeSetupFixRouter from './stripe-setup-fix.js';
import timelineRouter from './timeline.js';
import relationshipsRouter from './relationships.js';
import betaGuildRouter from './beta-guild.js';
import exportRouter from './export.js';
import seriesRouter from './series.js';
import collaborationRouter from './collaboration.js';
import generateNamesRouter from './generate-names.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    
    // Register webhook route FIRST to avoid conflicts with other routes
    // This must be before JSON parsing middleware
    router.use('/webhook', stripeWebhookRouter);
    
    // Register other routes
    router.use('/stripe', stripeRouter);
    router.use('/init', initRouter);
    router.use('/stripe-setup', stripeSetupRouter);
    router.use('/stripe-setup-fix', stripeSetupFixRouter);
    
    // Premium feature routes with tier checks
    router.use('/timeline', timelineRouter);
    router.use('/relationships', relationshipsRouter);
    router.use('/beta-guild', betaGuildRouter);
    router.use('/export', exportRouter);
    router.use('/series', seriesRouter);
    router.use('/collaboration', collaborationRouter);
    
    // Public utility routes
    router.use('/generate-names', generateNamesRouter);

    return router;
};