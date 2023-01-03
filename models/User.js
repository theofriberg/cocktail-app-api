const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [Number],
        default: [1]
    },
    aboutMe: {
        type: String,
        default: 'Hello!'
    },
    favDrink: {
        type: String
    },
    leastFavDrink: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)