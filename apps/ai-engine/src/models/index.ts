// AI Model Definitions - OpenRouter
export const MODELS = {
  RECOMMENDATION: 'meta-llama/llama-2-7b-chat',
  CHAT: 'openai/gpt-3.5-turbo',
  ADVANCED: 'openai/gpt-4',
  SENTIMENT: 'meta-llama/llama-2-7b-chat',
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];
