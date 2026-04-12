import { describe, it, expect, beforeEach } from 'vitest'
import { HuggingFaceService } from '../services/index'

describe('HuggingFaceService', () => {
  let service: HuggingFaceService

  beforeEach(() => {
    service = new HuggingFaceService({
      apiKey: 'test-key',
      model: 'gpt2',
      temperature: 0.7,
    })
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(service).toBeDefined()
    })

    it('should handle empty config', () => {
      const emptyService = new HuggingFaceService({ apiKey: 'key' })
      expect(emptyService).toBeDefined()
    })
  })

  describe('generateText', () => {
    it('should throw not implemented error', async () => {
      await expect(service.generateText('test prompt')).rejects.toThrow(
        'Not implemented'
      )
    })

    it('should handle empty prompt', async () => {
      await expect(service.generateText('')).rejects.toThrow()
    })
  })

  describe('generateEmbedding', () => {
    it('should throw not implemented error', async () => {
      await expect(service.generateEmbedding('test text')).rejects.toThrow(
        'Not implemented'
      )
    })

    it('should handle empty text', async () => {
      await expect(service.generateEmbedding('')).rejects.toThrow()
    })
  })
})
