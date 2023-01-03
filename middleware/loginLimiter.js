const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message:
        { message: 'To many login attempts from this IP' },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = loginLimiter