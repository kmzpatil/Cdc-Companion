import { Request, Response, NextFunction } from 'express'

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * Custom memory-based rate limiter middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests allowed in the time window
 */
export function rateLimiter(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip'
    const now = Date.now()

    // Cleanup expired entries to prevent memory leak
    if (ipRequestCounts.size > 5000) {
      for (const [key, val] of ipRequestCounts.entries()) {
        if (now > val.resetTime) {
          ipRequestCounts.delete(key)
        }
      }
    }

    let record = ipRequestCounts.get(ip)

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    record.count++
    ipRequestCounts.set(ip, record)

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

    if (record.count > maxRequests) {
      res.status(429).json({
        error: 'Too many requests, please try again later.'
      })
      return
    }

    next()
  }
}
