import { CommunityNormalizationSchema } from '../schemas/report.js';
import { ProviderAnalysisSchema } from '../schemas/analysis.js';
import { ai, defaultGoogleModel } from '../genkit.js';
import { buildCommunityPrompt } from '../prompts/community-report-normalization.v1.js';
import { buildExplanationInstruction } from '../prompts/explanation-generation.v1.js';
import { buildMessagePrompt } from '../prompts/scam-message-analysis.v1.js';
import { buildPhonePrompt } from '../prompts/phone-risk-analysis.v1.js';
import { buildScreenshotPrompt } from '../prompts/screenshot-analysis.v1.js';
import { buildUrlPrompt } from '../prompts/phishing-url-analysis.v1.js';
import { coerceCommunityNormalization, coerceProviderAnalysis } from './providerOutputUtils.js';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function promptForInput(context) {
  if (context.normalizedInput.detectedKind === 'url') {
    return buildUrlPrompt(context);
  }

  if (context.normalizedInput.detectedKind === 'phone') {
    return buildPhonePrompt(context);
  }

  if (context.normalizedInput.detectedKind === 'image') {
    return buildScreenshotPrompt(context);
  }

  return buildMessagePrompt(context);
}

function extractOutput(response) {
  if (response.output) {
    return response.output;
  }

  try {
    return JSON.parse(response.text);
  } catch {
    return null;
  }
}

function isRetryableGeminiError(error) {
  const message = String(error?.message ?? '');
  return error?.code === 429 || error?.code === 500 || error?.code === 503 || /UNAVAILABLE|high demand|RESOURCE_EXHAUSTED/i.test(message);
}

async function withRetry(operation, attempts = 3) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error) || attempt === attempts - 1) {
        throw error;
      }

      await sleep(600 * 2 ** attempt);
    }
  }

  throw lastError;
}

export class GeminiProvider {
  async analyzeThreat(context) {
    const prompt = promptForInput(context);
    const request = {
      model: defaultGoogleModel,
      system: `${prompt.system}\n\n${buildExplanationInstruction()}`,
      prompt: prompt.prompt,
      output: { schema: ProviderAnalysisSchema, constrained: true }
    };

    if (context.normalizedInput.file?.bufferBase64) {
      request.prompt = [
        {
          media: {
            url: `data:${context.normalizedInput.file.mimetype};base64,${context.normalizedInput.file.bufferBase64}`
          }
        },
        { text: prompt.prompt }
      ];
    }

    try {
      const response = await withRetry(() => ai.generate(request));
      return coerceProviderAnalysis({
        payload: extractOutput(response),
        responseText: response.text,
        context
      });
    } catch (error) {
      if (isRetryableGeminiError(error)) {
        const wrapped = new Error('Gemini is currently under heavy demand. Retry in a moment or switch to mock mode for demo reliability.');
        wrapped.statusCode = 503;
        throw wrapped;
      }

      throw error;
    }
  }

  async normalizeCommunityReport({ submission, sanitizedText }) {
    const prompt = buildCommunityPrompt({ submission, sanitizedText });
    try {
      const response = await withRetry(() =>
        ai.generate({
          model: defaultGoogleModel,
          system: prompt.system,
          prompt: prompt.prompt,
          output: { schema: CommunityNormalizationSchema, constrained: true }
        })
      );

      return coerceCommunityNormalization({
        payload: extractOutput(response),
        responseText: response.text,
        submission,
        sanitizedText
      });
    } catch (error) {
      if (isRetryableGeminiError(error)) {
        const wrapped = new Error('Gemini is currently under heavy demand. Retry in a moment or switch to mock mode for demo reliability.');
        wrapped.statusCode = 503;
        throw wrapped;
      }

      throw error;
    }
  }
}
