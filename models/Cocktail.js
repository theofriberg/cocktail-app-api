const mongoose = require('mongoose')
const path = require('path')

const cocktailImageBasePath = 'uploads/cocktailImages'

const cocktailSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    alcoholbase: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageName: {
        type: String,
        required: true
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Cocktail', cocktailSchema)
module.exports.cocktailImageBasePath = cocktailImageBasePath