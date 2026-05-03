import express from 'express';
import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { authorStyles } from '../prompts/authorStyles.js';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getSystemPrompt = (type) => {
  const prompts = {
    improve: 'You are an expert writing editor. Improve the given text by enhancing clarity, grammar, and overall quality while maintaining the original meaning and tone.',
    expand: 'You are a creative writing assistant. Expand the given text by adding more details, examples, and depth while maintaining coherence and relevance.',
    shorten: 'You are a concise writing expert. Shorten the given text by removing redundancies and unnecessary details while preserving the core message.',
    rephrase: 'You are a skilled wordsmith. Rephrase the given text in a different way while maintaining the exact same meaning and intent.',
  };
  return prompts[type] || prompts.improve;
};

const getFocusAreaPrompt = (focusArea) => {
  const prompts = {
    grammar: 'Focus on correcting grammar, punctuation, and syntax errors. Identify each issue and provide the correction.',
    clarity: 'Focus on improving clarity and readability. Identify confusing passages and suggest clearer alternatives.',
    tone: 'Focus on adjusting the tone to be more professional, engaging, or appropriate for the audience. Identify tone issues and suggest improvements.',
    pacing: 'Focus on improving the flow and pacing of the text. Identify sections that feel rushed or slow and suggest improvements.',
    engagement: 'Focus on making the text more engaging and compelling. Identify dull sections and suggest ways to captivate the reader.',
  };
  return prompts[focusArea] || prompts.grammar;
};

const appendAuthorStyle = (basePrompt, authorStyleKey) => {
  if (authorStyleKey && authorStyles[authorStyleKey]) {
    const style = authorStyles[authorStyleKey];
    return `${basePrompt}\n\nWrite in the style of ${style.display}: ${style.description}. Sample: "${style.sample}"`;
  }
  return basePrompt;
};

// POST /openai/writing-suggestions
router.post('/writing-suggestions', async (req, res) => {
  const { text, context, type, authorStyle } = req.body;

  if (!text || !type) {
    return res.status(400).json({ error: 'text and type are required' });
  }

  const validTypes = ['improve', 'expand', 'shorten', 'rephrase'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
  }

  let systemPrompt = getSystemPrompt(type);
  systemPrompt = appendAuthorStyle(systemPrompt, authorStyle);

  const userMessage = context
    ? `Context: ${context}\n\nText to ${type}: ${text}`
    : `Text to ${type}: ${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
  });

  const suggestion = response.choices[0].message.content;

  res.json({
    suggestion,
    original: text,
    type,
  });
});

// POST /openai/writing-prompts
router.post('/writing-prompts', async (req, res) => {
  const { genre, theme, length, authorStyle } = req.body;

  if (!genre || !theme) {
    return res.status(400).json({ error: 'genre and theme are required' });
  }

  const lengthDesc = length || 'medium';
  const userMessage = `Generate 3 creative writing prompts for a ${lengthDesc}-length story in the ${genre} genre with the theme of "${theme}". For each prompt, provide a title and a detailed description.`;

  let systemPrompt = 'You are a creative writing prompt generator. Generate engaging and unique writing prompts that inspire creativity.';
  systemPrompt = appendAuthorStyle(systemPrompt, authorStyle);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;

  // Parse the response to extract prompts
  const prompts = [
    {
      title: 'Generated Prompt 1',
      description: content,
      genre,
    },
  ];

  res.json(prompts);
});

// POST /openai/character-dialogue
router.post('/character-dialogue', async (req, res) => {
  const { characterName, characterDescription, context, tone, authorStyle } = req.body;

  if (!characterName || !characterDescription || !context) {
    return res.status(400).json({ error: 'characterName, characterDescription, and context are required' });
  }

  const toneDesc = tone || 'natural';
  const userMessage = `Generate realistic dialogue for a character named "${characterName}" with the following description: ${characterDescription}. The dialogue should be in a ${toneDesc} tone and fit this context: ${context}`;

  let systemPrompt = 'You are an expert dialogue writer. Create realistic, character-appropriate dialogue that fits the given context and tone.';
  systemPrompt = appendAuthorStyle(systemPrompt, authorStyle);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
  });

  const dialogue = response.choices[0].message.content;

  res.json({
    dialogue,
    character: characterName,
    context,
  });
});

// POST /openai/content-improvement
router.post('/content-improvement', async (req, res) => {
  const { text, focusArea, authorStyle } = req.body;

  if (!text || !focusArea) {
    return res.status(400).json({ error: 'text and focusArea are required' });
  }

  const validFocusAreas = ['grammar', 'clarity', 'tone', 'pacing', 'engagement'];
  if (!validFocusAreas.includes(focusArea)) {
    return res.status(400).json({ error: `focusArea must be one of: ${validFocusAreas.join(', ')}` });
  }

  const focusPrompt = getFocusAreaPrompt(focusArea);
  const userMessage = `${focusPrompt}\n\nText to improve:\n${text}\n\nProvide the improved version and list specific issues found with their fixes.`;

  let systemPrompt = 'You are an expert content editor. Analyze the text and provide improvements with specific suggestions.';
  systemPrompt = appendAuthorStyle(systemPrompt, authorStyle);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;

  // Parse response to extract improved text and suggestions
  const suggestions = [
    {
      issue: 'Content analyzed',
      fix: 'See improved version below',
    },
  ];

  res.json({
    original: text,
    improved: content,
    suggestions,
  });
});

export default router;