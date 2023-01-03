const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    cocktail: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cocktail'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Comment', commentSchema)