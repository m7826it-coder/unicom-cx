// src/config/gemini.ts
import { env } from './env.js';

export const geminiConfig = {
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_MODEL,
  maxTokens: 1024,
  temperature: 0.7,
} as const;