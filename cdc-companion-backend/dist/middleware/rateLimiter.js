"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = rateLimiter;
const ipRequestCounts = new Map();
/**
 * Custom memory-based rate limiter middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests allowed in the time window
 */
function rateLimiter(windowMs, maxRequests) {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
        const now = Date.now();
        let record = ipRequestCounts.get(ip);
        if (!record || now > record.resetTime) {
            record = {
                count: 0,
                resetTime: now + windowMs
            };
        }
        record.count++;
        ipRequestCounts.set(ip, record);
        // Set standard rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        if (record.count > maxRequests) {
            res.status(429).json({
                error: 'Too many requests, please try again later.'
            });
            return;
        }
        next();
    };
}
