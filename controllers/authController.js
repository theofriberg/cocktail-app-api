const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../config/cloudinaryOptions')
const User = require('../models/User')

/**
 * @desc Login
 * @route POST /auth
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const foundUser = await User.findOne({ username }).exec()
    if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

    const matchPasswords = await bcrypt.compare(password, foundUser.password)
    if (!matchPasswords) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )
    
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ userId: foundUser._id, roles: foundUser.roles, accessToken })
})

/**
 * @desc Refresh access token
 * @route GET /auth/refresh
 * @access Public
 */

const refresh = asyncHandler((req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })
            
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ userId: foundUser._id, roles: foundUser.roles, accessToken })
        })
})

/**
 * @desc Logout
 * @route POST /auth/logout
 * @access Public
 */
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared'})
})

/**
 * @desc Get cloudinary signature
 * @route GET /auth/cloudinary
 * @access Private
 */
const getCloudinarySignature = (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp
        },
        process.env.CLOUDINARY_SECRET
    )
    res.json({ timestamp, signature })
}

module.exports = {
    login,
    refresh,
    logout,
    getCloudinarySignature
}