const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userUrls = require('./routes/userRoutes')
const hatThemeUrls = require('./routes/hatThemeRoutes')
const drawnWordsUrls = require('./routes/drawnWordsRoutes')
const cors = require('cors')


dotenv.config()

mongoose.connect(process.env.DATABASE_ACCESS)

app.use(express.json())
app.use(cors())
app.use('/api/user', userUrls)
app.use('/api/hat-theme', hatThemeUrls)
app.use('/api/drawn-words', drawnWordsUrls)
app.listen(4000, () =>console.log("server is listening on port 4000"))

