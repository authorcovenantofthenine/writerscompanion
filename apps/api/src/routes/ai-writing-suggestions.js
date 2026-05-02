import express from 'express';
import OpenAI from 'openai';
import logger from '../utils/logger.js';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const categoryPrompts = {
  dialogue: {
    systemPrompt: 'You are an expert dialogue writer. Generate realistic, character-appropriate dialogue suggestions that feel natural and advance the story.',
    userPromptTemplate: (prompt, context) => `Generate 3 dialogue suggestions for this scenario:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
  description: {
    systemPrompt: 'You are a master of vivid, evocative descriptions. Generate descriptive writing suggestions that bring scenes to life with sensory details and imagery.',
    userPromptTemplate: (prompt, context) => `Generate 3 descriptive writing suggestions for this scene:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
  plot: {
    systemPrompt: 'You are an expert plot developer. Generate plot suggestions that create tension, advance the narrative, and maintain story coherence.',
    userPromptTemplate: (prompt, context) => `Generate 3 plot suggestions for this story moment:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
  character: {
    systemPrompt: 'You are a character development expert. Generate character suggestions that deepen personality, motivation, and emotional depth.',
    userPromptTemplate: (prompt, context) => `Generate 3 character development suggestions for this character moment:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
  pacing: {
    systemPrompt: 'You are a pacing expert. Generate suggestions to improve narrative flow, tension, and reader engagement through better pacing.',
    userPromptTemplate: (prompt, context) => `Generate 3 pacing suggestions for this narrative section:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
  worldbuilding: {
    systemPrompt: 'You are a worldbuilding expert. Generate suggestions that enhance the setting, atmosphere, and internal consistency of the story world.',
    userPromptTemplate: (prompt, context) => `Generate 3 worldbuilding suggestions for this story setting:\n\nContext: ${context}\n\nPrompt: ${prompt}\n\nProvide each suggestion as a separate line, numbered 1-3.`,
  },
};

/**
 * POST /ai-writing-suggestions
 * Generate contextual writing suggestions using OpenAI
 * Body: { prompt, context, category, storyId, projectId }
 * Returns: { suggestions: string[], category: string, relevance: number }
 */
router.post('/', async (req, res) => {
  const { prompt, context, category, storyId, projectId } = req.body;

  // Input validation
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  const validCategories = Object.keys(categoryPrompts);
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      error: `category must be one of: ${validCategories.join(', ')}`,
    });
  }

  const contextText = context || 'No additional context provided';

  logger.info('Generating writing suggestions', {
    category,
    storyId,
    projectId,
    promptLength: prompt.length,
    contextLength: contextText.length,
  });

  const categoryConfig = categoryPrompts[category];
  const userMessage = categoryConfig.userPromptTemplate(prompt, contextText);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: categoryConfig.systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  const responseText = response.choices[0].message.content;

  // Parse suggestions from numbered list
  const suggestionLines = responseText
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 0);

  // Calculate relevance score based on response quality
  // Higher relevance if response is substantial and contains multiple suggestions
  const relevance = Math.min(1, Math.max(0.5, suggestionLines.length / 3));

  logger.info('Writing suggestions generated successfully', {
    category,
    suggestionCount: suggestionLines.length,
    relevance,
  });

  res.json({
    suggestions: suggestionLines,
    category,
    relevance,
  });
});

export default router;