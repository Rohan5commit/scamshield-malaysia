import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

import { env } from './config.js';

function cleanModelName(modelName) {
  return modelName.replace(/^googleai\//, '');
}

const options = {};

if (env.hasGeminiKey) {
  options.plugins = [googleAI({ apiKey: env.GEMINI_API_KEY })];
  options.model = googleAI.model(cleanModelName(env.DEFAULT_MODEL));
}

export const ai = genkit(options);
export const defaultGoogleModel = env.hasGeminiKey ? googleAI.model(cleanModelName(env.DEFAULT_MODEL)) : null;

