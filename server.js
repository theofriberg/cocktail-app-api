require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConnect')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

const indexRouter = require('./routes/index')
const cocktailRouter = require('./routes/cocktailRouter')

connectDB()

app.use(express.json())

app.use(cookieParser())

app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

app.use('/cocktails', cocktailRouter)

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.on('error', err => {
    console.log(err)
})

mongoose.connection.once('open', () => {
    console.log('Connected to Mongo')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

