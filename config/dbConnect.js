const mongoose = require('mongoose')

const connectDB = () => {
    try {
        mongoose.connect(process.env.DATABASE_URL)
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB