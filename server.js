const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userUrls = require('./routes/userRoutes')
const hatThemeUrls = require('./routes/hatThemeRoutes')
const drawnWordsUrls = require('./routes/drawnWordsRoutes')
const groupUrls = require('./routes/groupRoutes')
const lessonUrls = require('./routes/lessonRoutes')
const cors = require('cors')


dotenv.config()

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_ACCESS;

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(cors())
app.use('/api/user', userUrls)
app.use('/api/hat-theme', hatThemeUrls)
app.use('/api/drawn-words', drawnWordsUrls)
app.use('/api/group', groupUrls)
app.use('/api/lesson', lessonUrls)
app.listen(PORT, () =>console.log(`Server running on port ${PORT}`))

