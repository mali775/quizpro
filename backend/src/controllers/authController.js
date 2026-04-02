const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const pool   = require('../../config/database')

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // Check duplicate
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length) {
      return res.status(409).json({ message: 'Email уже используется' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, is_approved)
       VALUES ($1, $2, $3, $4, 'student', FALSE)
       RETURNING id, first_name, last_name, email, role, is_approved, created_at`,
      [firstName, lastName, email, hashed]
    )

    const user  = rows[0]
    const token = signToken(user.id)

    res.status(201).json({
      token,
      user: {
        id:         user.id,
        firstName:  user.first_name,
        lastName:   user.last_name,
        email:      user.email,
        role:       user.role,
        isApproved: user.is_approved,
        createdAt:  user.created_at,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (!rows.length) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const user  = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const token = signToken(user.id)

    res.json({
      token,
      user: {
        id:         user.id,
        firstName:  user.first_name,
        lastName:   user.last_name,
        email:      user.email,
        role:       user.role,
        isApproved: user.is_approved,
        createdAt:  user.created_at,
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
const me = async (req, res) => {
  const u = req.user
  res.json({
    id:         u.id,
    firstName:  u.first_name,
    lastName:   u.last_name,
    email:      u.email,
    role:       u.role,
    isApproved: u.is_approved,
  })
}

module.exports = { register, login, me }
