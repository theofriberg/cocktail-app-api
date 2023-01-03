const mongoose = require('mongoose')

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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    imageName: {
        type: String,
        required: true
    }
},
{
    timestamps: true
})

cocktailSchema.statics.getAlcoholBaseList = async function() {
    const cocktails = await this.find().select('alcoholbase -_id').exec()
    return [...new Set(cocktails.map(base => base.alcoholbase))]
}

module.exports = mongoose.model('Cocktail', cocktailSchema)
module.exports.cocktailImageBasePath = cocktailImageBasePath