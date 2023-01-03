const express = require('express')
const router = express.Router()
const loginLimiter = require('../middleware/loginLimiter')
const verifyJWT = require('../middleware/verifyJWT')
const {
    login,
    refresh,
    logout,
    getCloudinarySignature
} = require('../controllers/authController')

router.route('/')
    .post(loginLimiter, login)

router.route('/refresh')
    .get(refresh)

router.route('/logout')
    .post(logout)

router.route('/cloudinary')
    .get(verifyJWT, getCloudinarySignature)

module.exports = router