require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const routes  = require('./routes')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT || 6000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logger (dev) ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.path}`)
    next()
  })
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── 404 + global error handler ────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 QuizPro backend running on http://localhost:${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Client URL  : ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`)
})

module.exports = app
