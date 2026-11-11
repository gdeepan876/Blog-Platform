// Simple memory-based rate limiter
function createRateLimiter({ windowMs = 60 * 1000, max = 30, message = 'Too many requests, please try again later.' }) {
  const requests = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now - record.startTime > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);
  if (timer.unref) timer.unref();

  return function rateLimiter(req, res, next) {
    const key = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
    const now = Date.now();

    const record = requests.get(key);
    if (!record || now - record.startTime > windowMs) {
      requests.set(key, { count: 1, startTime: now });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    record.count += 1;
    next();
  };
}

module.exports = {
  createRateLimiter
};

