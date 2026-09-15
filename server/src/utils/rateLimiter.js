const requests = new Map();

const rateLimiter = (limit = 30, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    const record = requests.get(key);

    if (!record || now - record.start >= windowMs) {
      requests.set(key, {
        start: now,
        count: 1
      });

      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later."
      });
    }

    record.count++;
    next();
  };
};

export default rateLimiter;