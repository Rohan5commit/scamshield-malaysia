import { CommunityNormalizationSchema } from '../schemas/report.js';
import { ProviderAnalysisSchema } from '../schemas/analysis.js';
import { ai, defaultGoogleModel } from '../genkit.js';
import { buildCommunityPrompt } from '../prompts/community-report-normalization.v1.js';
import { buildExplanationInstruction } from '../prompts/explanation-generation.v1.js';
import { buildMessagePrompt } from '../prompts/scam-message-analysis.v1.js';
import { buildPhonePrompt } from '../prompts/phone-risk-analysis.v1.js';
import { buildScreenshotPrompt } from '../prompts/screenshot-analysis.v1.js';
import { buildUrlPrompt } from '../prompts/phishing-url-analysis.v1.js';

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

  return JSON.parse(response.text);
}

export class GeminiProvider {
  async analyzeThreat(context) {
    const prompt = promptForInput(context);
    const request = {
      model: defaultGoogleModel,
      system: `${prompt.system}\n\n${buildExplanationInstruction()}`,
      prompt: prompt.prompt,
      output: { schema: ProviderAnalysisSchema }
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

    const response = await ai.generate(request);
    return ProviderAnalysisSchema.parse(extractOutput(response));
  }

  async normalizeCommunityReport({ submission, sanitizedText }) {
    const prompt = buildCommunityPrompt({ submission, sanitizedText });
    const response = await ai.generate({
      model: defaultGoogleModel,
      system: prompt.system,
      prompt: prompt.prompt,
      output: { schema: CommunityNormalizationSchema }
    });

    return CommunityNormalizationSchema.parse(extractOutput(response));
  }
}

