// AI Model Definitions - OpenRouter
export const MODELS = {
  RECOMMENDATION: 'google/gemma-4-31b-it:free',
  CHAT: 'nvidia/nemotron-3-super-120b-a12b:free',
  ADVANCED: 'google/gemma-4-31b-it:free',
  SENTIMENT: 'nvidia/nemotron-3-super-120b-a12b:free',
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];
