// Service exports
import axios, { AxiosInstance } from 'axios'

export interface AIServiceConfig {
  apiKey: string
  model?: string
  temperature?: number
  baseUrl?: string
}

/**
 * OpenRouter AI Service Provider
 * Supports multiple models through OpenRouter API
 * Documentation: https://openrouter.ai/docs
 */
export class OpenRouterService {
  private config: AIServiceConfig
  private client: AxiosInstance

  constructor(config: AIServiceConfig) {
    this.config = {
      baseUrl: 'https://openrouter.ai/api/v1',
      temperature: 0.7,
      ...config,
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://unilodge.app',
        'X-Title': 'UniLodge AI Assistant',
      },
    })
  }

  /**
   * Generate chat response using OpenRouter
   * @param prompt User message/prompt
   * @param model Optional model override
   * @returns Generated text response
   */
  async generateText(prompt: string, model?: string): Promise<string> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: model || this.config.model || 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: 1000,
      })

      return (
        response.data?.choices?.[0]?.message?.content ||
        'Unable to generate response'
      )
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      console.error(`OpenRouter API error: ${err}`)
      throw new Error(`Failed to generate text: ${err}`)
    }
  }

  /**
   * Generate streaming response (useful for real-time chat)
   * @param prompt User message/prompt
   * @yields Text chunks as they arrive
   */
  async *generateTextStream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await this.client.post(
        '/chat/completions',
        {
          model: this.config.model || 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.config.temperature,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      )

      for await (const chunk of response.data) {
        const text = chunk.toString()
        const lines = text.split('\n').filter((line) => line.length > 0)

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed?.choices?.[0]?.delta?.content
              if (content) yield content
            } catch {
              // Skip unparseable lines
            }
          }
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to generate stream: ${err}`)
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/models')
      return response.data?.data?.map((m: any) => m.id) || []
    } catch (error) {
      console.warn('Could not fetch models list')
      return []
    }
  }
}

/**
 * Legacy HuggingFace Service (kept for backward compatibility)
 */
export class HuggingFaceService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async generateText(_prompt: string): Promise<string> {
    throw new Error('HuggingFace service deprecated. Use OpenRouterService instead.')
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error('HuggingFace service deprecated. Use OpenRouterService instead.')
  }
}

// Export OpenRouter as default service
export default OpenRouterService
