'use client'

import { useState, useCallback } from 'react'
import { chatService } from '../services/ChatService'

interface UseChatOptions {
  onStreamChunk?: (chunk: string) => void
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<string>('')

  const sendMessage = useCallback(
    async (message: string, context?: string) => {
      setLoading(true)
      setError(null)
      setResponse('')

      try {
        const result = await chatService.sendMessage({ message, context })
        setResponse(result)
        options.onComplete?.(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const streamMessage = useCallback(
    async (message: string, context?: string) => {
      setLoading(true)
      setError(null)
      setResponse('')

      try {
        let fullResponse = ''
        for await (const chunk of chatService.streamMessage({ message, context })) {
          fullResponse += chunk
          setResponse(fullResponse)
          options.onStreamChunk?.(chunk)
        }
        options.onComplete?.(fullResponse)
        return fullResponse
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to stream message'
        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const getRoomRecommendations = useCallback(
    async (budget: number, preferences?: string[], location?: string) => {
      setLoading(true)
      setError(null)
      setResponse('')

      try {
        const result = await chatService.getRoomRecommendations({
          budget,
          preferences,
          location,
        })
        setResponse(result)
        options.onComplete?.(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations'
        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const analyzeRoom = useCallback(
    async (roomData: any, userProfile?: any) => {
      setLoading(true)
      setError(null)
      setResponse('')

      try {
        const result = await chatService.analyzeRoom(roomData, userProfile)
        setResponse(result)
        options.onComplete?.(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze room'
        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResponse('')
  }, [])

  return {
    sendMessage,
    streamMessage,
    getRoomRecommendations,
    analyzeRoom,
    loading,
    error,
    response,
    reset,
  }
}
