import type { ProgressQuery, ProgressResponse } from '../../../types/progress'
import { getProgressService } from '../../services/ProgressService'
import { getClientIP } from '../../utils/clientIP'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const clientIP = getClientIP(event)

    // Use IP from query if provided (for testing), otherwise use detected IP
    const ipAddress = (query.ipAddress as string) || clientIP

    // Parse boolean query parameters (query params are always strings)
    const includeRecentGames = query.includeRecentGames !== 'false'
    const includeAchievements = query.includeAchievements !== 'false'

    const progressService = getProgressService()
    const progress = await progressService.getUserProgress(ipAddress, {
      includeRecentGames,
      includeAchievements
    })

    const response: ProgressResponse = {
      success: true,
      progress
    }

    return response

  } catch (error) {
    console.error('Progress retrieval error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to retrieve progress'
    })
  }
})