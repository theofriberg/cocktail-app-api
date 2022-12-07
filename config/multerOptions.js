const multer = require('multer')
const fs = require('fs')
const path = require('path')

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const Cocktail = require('../models/Cocktail')
const uploadPath = path.join('public', Cocktail.cocktailImageBasePath)

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

const removeCocktailImage = (fileName) => {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) {
            console.log(err)
        }
        console.log(`${fileName} was deleted`)
    })
}

module.exports = {
    upload,
    removeCocktailImage
}

