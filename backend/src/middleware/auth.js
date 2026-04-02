const jwt  = require('jsonwebtoken')
const pool = require('../../config/database')

// ── Verify token ─────────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Токен не предоставлен' })
    }

    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role, is_approved FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (!rows.length) {
      return res.status(401).json({ message: 'Пользователь не найден' })
    }

    req.user = rows[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истёк' })
    }
    return res.status(401).json({ message: 'Недействительный токен' })
  }
}

// ── Require admin role ────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещён: требуется роль admin' })
  }
  next()
}

// ── Require approved student ─────────────────────────────────────────────────
const requireApproved = (req, res, next) => {
  if (req.user?.role === 'student' && !req.user.is_approved) {
    return res.status(403).json({ message: 'Аккаунт ожидает одобрения' })
  }
  next()
}

module.exports = { authenticate, requireAdmin, requireApproved }
