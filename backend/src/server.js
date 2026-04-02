require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const routes  = require('./routes')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app  = express()
// Render-де PORT автоматты түрде 10000 болады, бірақ біз резерв қалдырамыз
const PORT = process.env.PORT || 10000

// ── Middleware (CORS ТҮЗЕТІЛГЕН НҰСҚАСЫ) ──────────────────────────────────────
app.use(cors({
  // '*' барлық сайтқа рұқсат береді, бұл қателерді жоюдың ең сенімді жолы
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logger (тек дайындау кезінде) ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.path}`)
    next()
  })
}

// ── Health check (Сервер тірі екенін тексеру үшін) ──────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── 404 + global error handler ────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 QuizPro backend running!`)
  console.log(`   Port        : ${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   CORS        : Enabled for all origins (*)\n`)
})

module.exports = app