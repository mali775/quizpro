const pool = require('../../config/database')

// GET /api/results  (admin – all; student – own)
const getResults = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const query   = isAdmin
      ? `SELECT r.*, u.first_name, u.last_name, u.email, t.title as test_title
         FROM results r
         JOIN users u ON r.user_id = u.id
         JOIN tests t ON r.test_id = t.id
         ORDER BY r.completed_at DESC`
      : `SELECT r.*, t.title as test_title
         FROM results r
         JOIN tests t ON r.test_id = t.id
         WHERE r.user_id = $1
         ORDER BY r.completed_at DESC`

    const params  = isAdmin ? [] : [req.user.id]
    const { rows } = await pool.query(query, params)

    res.json(rows.map((r) => ({
      id:          r.id,
      userId:      r.user_id,
      testId:      r.test_id,
      testTitle:   r.test_title,
      score:       r.score,
      maxScore:    r.max_score,
      percentage:  r.percentage,
      passed:      r.passed,
      completedAt: r.completed_at,
      ...(isAdmin && {
        studentName:  `${r.first_name} ${r.last_name}`,
        studentEmail: r.email,
      }),
    })))
  } catch (err) {
    next(err)
  }
}

// GET /api/results/:id  (owner or admin)
const getResultById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.title as test_title, t.min_pass_score
       FROM results r JOIN tests t ON r.test_id = t.id
       WHERE r.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Результат не найден' })

    const result = rows[0]
    if (req.user.role !== 'admin' && result.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещён' })
    }

    // fetch per-question answers
    const { rows: answers } = await pool.query(
      'SELECT * FROM result_answers WHERE result_id = $1',
      [result.id]
    )

    res.json({
      id:          result.id,
      userId:      result.user_id,
      testId:      result.test_id,
      testTitle:   result.test_title,
      score:       result.score,
      maxScore:    result.max_score,
      percentage:  result.percentage,
      passed:      result.passed,
      completedAt: result.completed_at,
      answers: answers.map((a) => ({
        questionId: a.question_id,
        answer:     (() => { try { return JSON.parse(a.answer) } catch { return a.answer } })(),
        isCorrect:  a.is_correct,
      })),
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/results  (student)
const submitResult = async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { testId, score, maxScore, percentage, passed, completedAt, answers } = req.body

    // Check attempt limit
    const test = await client.query('SELECT attempts FROM tests WHERE id = $1', [testId])
    if (!test.rows.length) return res.status(404).json({ message: 'Тест не найден' })

    const used = await client.query(
      'SELECT COUNT(*) FROM results WHERE user_id = $1 AND test_id = $2',
      [req.user.id, testId]
    )
    if (Number(used.rows[0].count) >= test.rows[0].attempts) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'Попытки исчерпаны' })
    }

    // Insert result
    const { rows } = await client.query(
      `INSERT INTO results (user_id, test_id, score, max_score, percentage, passed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, testId, score, maxScore, percentage, passed, completedAt || new Date()]
    )
    const result = rows[0]

    // Insert per-question answers
    if (Array.isArray(answers)) {
      for (const a of answers) {
        await client.query(
          `INSERT INTO result_answers (result_id, question_id, answer, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [result.id, a.questionId, JSON.stringify(a.answer), a.isCorrect]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json({
      id:          result.id,
      userId:      result.user_id,
      testId:      result.test_id,
      score:       result.score,
      maxScore:    result.max_score,
      percentage:  result.percentage,
      passed:      result.passed,
      completedAt: result.completed_at,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

module.exports = { getResults, getResultById, submitResult }
