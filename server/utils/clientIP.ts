import type { H3Event } from 'h3'

/**
 * Get client IP address from various headers and sources
 * @param event - H3 event object
 * @returns Client IP address as string
 */
export function getClientIP(event: H3Event): string {
  // Try to get IP from various headers (in order of preference)
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket?.remoteAddress
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    const firstIP = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0]
    return firstIP.trim()
  }
  
  // x-real-ip header
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP
  }
  
  // Direct socket connection
  if (remoteAddress) {
    return remoteAddress
  }
  
  // Fallback for local development
  return '127.0.0.1'
}

/**
 * Validate if an IP address looks reasonable
 * @param ip - IP address string
 * @returns boolean indicating if IP looks valid
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false
  }
  
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  // Local development addresses
  const localAddresses = ['127.0.0.1', 'localhost', '::1']
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || localAddresses.includes(ip)
}