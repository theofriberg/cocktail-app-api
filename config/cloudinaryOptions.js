const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dzw78lwng', 
    api_key: '177412211512353',
    api_secret: process.env.CLOUDINARY_SECRET
})

module.exports = cloudinary