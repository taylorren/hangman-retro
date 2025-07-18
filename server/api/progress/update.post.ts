import type { ProgressUpdateRequest, ProgressResponse } from '../../../types/progress'
import { getProgressService } from '../../services/ProgressService'
import { getClientIP } from '../../utils/clientIP'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as ProgressUpdateRequest
    const clientIP = getClientIP(event)

    // Use IP from body if provided (for testing), otherwise use detected IP
    const ipAddress = body.ipAddress || clientIP

    if (!body.gameRecord) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Game record is required'
      })
    }

    // Basic validation
    const { gameRecord } = body
    if (!gameRecord.difficulty || typeof gameRecord.won !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid game record format'
      })
    }

    const progressService = getProgressService()
    const result = await progressService.updateProgress(ipAddress, gameRecord)

    const response: ProgressResponse = {
      success: true,
      progress: result.progress,
      newAchievements: result.newAchievements
    }

    return response

  } catch (error) {
    console.error('Progress update error:', error)

    // Check if it's an HTTP error with statusCode
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error // Re-throw HTTP errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to update progress'
    })
  }
})