const { validationResult } = require('express-validator')

// ── Validate express-validator results ───────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Ошибка валидации',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

// ── Global error handler ─────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message)

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Запись уже существует (дубликат)' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Связанная запись не найдена' })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
  })
}

// ── 404 handler ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ message: `Маршрут ${req.method} ${req.path} не найден` })
}

module.exports = { validate, errorHandler, notFound }
