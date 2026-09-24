import rateLimit from 'express-rate-limit';

// Standard API rate limiter (100 requests per 15 minutes)
export const standardApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Strict AI Rate Limiter for Gemini endpoints (25 requests per minute)
export const aiForensicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI Forensics rate limit reached. Please wait 60 seconds before initiating further synthesis.'
  }
});
