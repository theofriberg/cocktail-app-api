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

cocktailSchema.virtual('cocktailImagePath').get(function() {
    if (this.imageName != null) {
        return path.join(cocktailImageBasePath, this.imageName)
    }
})

module.exports = mongoose.model('Cocktail', cocktailSchema)
module.exports.cocktailImageBasePath = cocktailImageBasePath