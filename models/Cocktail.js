const mongoose = require('mongoose')

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
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Cocktail', cocktailSchema)