export interface AIRequest {
  type: 'price_suggestion' | 'chat' | 'recommendation'
  payload: Record<string, any>
}

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    tokensUsed?: number
    model?: string
    latencyMs?: number
  }
}

export interface PriceSuggestionInput {
  roomType: string
  basePrice: number
  amenities: string[]
  season?: string
}

export interface ChatInput {
  message: string
  context?: Record<string, any>
}
