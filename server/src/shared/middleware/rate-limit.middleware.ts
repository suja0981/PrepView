import rateLimit from "express-rate-limit";

/** Tight limit for expensive AI calls (resume analysis, interview creation) */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests. Please wait before trying again." },
  },
});

/** Looser limit for answer submissions (5 per interview × many interviews) */
export const answerRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Submitting too quickly. Please slow down." },
  },
});

/** Strict limit for authentication to prevent brute-force (10 per 15 min) */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many login attempts. Please try again later." },
  },
});
