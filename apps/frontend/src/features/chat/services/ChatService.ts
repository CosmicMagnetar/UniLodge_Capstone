import axios, { AxiosInstance } from 'axios'

interface ChatMessage {
  message: string
  context?: string
}

interface RoomRecommendationParams {
  budget: number
  preferences?: string[]
  location?: string
}

interface Room {
  _id?: string
  name: string
  pricePerNight: number
  capacity: number
  amenities?: string[]
  location?: string
}

interface UserProfile {
  budget?: number
  preferences?: string[]
}

/**
 * Chat Service - Handles all AI chat communication with backend
 */
export class ChatService {
  private client: AxiosInstance

  constructor(apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(params: ChatMessage): Promise<string> {
    try {
      const response = await this.client.post('/chat/message', params)
      return response.data.response
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }

  /**
   * Stream a message response
   */
  async *streamMessage(params: ChatMessage): AsyncGenerator<string> {
    try {
      const response = await this.client.post('/chat/stream', params, {
        responseType: 'stream',
      })

      // Handle streaming response
      const reader = response.data.toString().split('\n')
      for (const line of reader) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.isDone) break
            if (data.chunk) yield data.chunk
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } catch (error) {
      console.error('Stream message error:', error)
      throw error
    }
  }

  /**
   * Get AI room recommendations
   */
  async getRoomRecommendations(params: RoomRecommendationParams): Promise<string> {
    try {
      const response = await this.client.post('/chat/room-recommendations', params)
      return response.data.recommendations
    } catch (error) {
      console.error('Get recommendations error:', error)
      throw error
    }
  }

  /**
   * Analyze a specific room
   */
  async analyzeRoom(roomData: Room, userProfile?: UserProfile): Promise<string> {
    try {
      const response = await this.client.post('/chat/analyze-room', {
        roomData,
        userProfile,
      })
      return response.data.analysis
    } catch (error) {
      console.error('Analyze room error:', error)
      throw error
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/chat/models')
      return response.data.models
    } catch (error) {
      console.error('Get models error:', error)
      throw error
    }
  }

  /**
   * Switch to a different model
   */
  async switchModel(model: string): Promise<void> {
    try {
      await this.client.post('/chat/switch-model', { model })
    } catch (error) {
      console.error('Switch model error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const chatService = new ChatService()
