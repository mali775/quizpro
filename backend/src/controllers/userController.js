const pool = require('../../config/database')

// GET /api/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, role, is_approved, created_at
       FROM users
       ORDER BY created_at DESC`
    )
    res.json(rows.map(u => ({
      id:         u.id,
      firstName:  u.first_name,
      lastName:   u.last_name,
      email:      u.email,
      role:       u.role,
      isApproved: u.is_approved,
      createdAt:  u.created_at,
    })))
  } catch (err) {
    next(err)
  }
}

// PATCH /api/users/:id/approve  (admin only)
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query(
      `UPDATE users SET is_approved = TRUE, updated_at = NOW()
       WHERE id = $1 AND role = 'student'
       RETURNING id, first_name, last_name, email, role, is_approved`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Пользователь не найден' })
    const u = rows[0]
    res.json({ id: u.id, firstName: u.first_name, lastName: u.last_name, isApproved: u.is_approved })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/users/:id/reject  (admin only)
const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query(
      `UPDATE users SET is_approved = FALSE, updated_at = NOW()
       WHERE id = $1 AND role = 'student'
       RETURNING id, first_name, last_name, email, role, is_approved`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Пользователь не найден' })
    const u = rows[0]
    res.json({ id: u.id, firstName: u.first_name, lastName: u.last_name, isApproved: u.is_approved })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllUsers, approveUser, rejectUser }
