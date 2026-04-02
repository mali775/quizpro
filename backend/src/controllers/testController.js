const pool = require('../../config/database')

// helper – fetch a test with all questions + options
const fetchTestWithQuestions = async (testId) => {
  const testRes = await pool.query('SELECT * FROM tests WHERE id = $1', [testId])
  if (!testRes.rows.length) return null
  const test = testRes.rows[0]

  const qRes = await pool.query(
    'SELECT * FROM questions WHERE test_id = $1 ORDER BY position, id',
    [testId]
  )

  const questions = await Promise.all(
    qRes.rows.map(async (q) => {
      const aRes = await pool.query(
        'SELECT * FROM answers WHERE question_id = $1 ORDER BY position, id',
        [q.id]
      )
      return {
        id:      q.id,
        testId:  q.test_id,
        type:    q.type,
        text:    q.text,
        options: aRes.rows.map((a) => ({
          id:        a.id,
          text:      a.text,
          isCorrect: a.is_correct,
        })),
      }
    })
  )

  return {
    id:               test.id,
    title:            test.title,
    description:      test.description,
    timeLimit:        test.time_limit,
    attempts:         test.attempts,
    minPassScore:     test.min_pass_score,
    shuffleQuestions: test.shuffle_questions,
    createdAt:        test.created_at,
    questions,
  }
}

// GET /api/tests
const getAllTests = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tests ORDER BY created_at DESC')
    const tests = await Promise.all(rows.map((t) => fetchTestWithQuestions(t.id)))
    res.json(tests)
  } catch (err) {
    next(err)
  }
}

// GET /api/tests/:id
const getTestById = async (req, res, next) => {
  try {
    const test = await fetchTestWithQuestions(Number(req.params.id))
    if (!test) return res.status(404).json({ message: 'Тест не найден' })
    res.json(test)
  } catch (err) {
    next(err)
  }
}

// POST /api/tests  (admin)
const createTest = async (req, res, next) => {
  try {
    const { title, description, timeLimit, attempts, minPassScore, shuffleQuestions } = req.body
    const { rows } = await pool.query(
      `INSERT INTO tests (title, description, time_limit, attempts, min_pass_score, shuffle_questions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || '', timeLimit || 30, attempts || 3, minPassScore || 60, shuffleQuestions !== false, req.user.id]
    )
    res.status(201).json(await fetchTestWithQuestions(rows[0].id))
  } catch (err) {
    next(err)
  }
}

// PUT /api/tests/:id  (admin)
const updateTest = async (req, res, next) => {
  try {
    const { title, description, timeLimit, attempts, minPassScore, shuffleQuestions } = req.body
    const { rows } = await pool.query(
      `UPDATE tests
       SET title=$1, description=$2, time_limit=$3, attempts=$4,
           min_pass_score=$5, shuffle_questions=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, description || '', timeLimit, attempts, minPassScore, shuffleQuestions, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Тест не найден' })
    res.json(await fetchTestWithQuestions(rows[0].id))
  } catch (err) {
    next(err)
  }
}

// DELETE /api/tests/:id  (admin)
const deleteTest = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tests WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ message: 'Тест не найден' })
    res.json({ message: 'Тест удалён' })
  } catch (err) {
    next(err)
  }
}

// POST /api/tests/:id/questions  (admin)
const addQuestion = async (req, res, next) => {
  try {
    const { type, text, options } = req.body
    const testId = Number(req.params.id)

    const qRes = await pool.query(
      'INSERT INTO questions (test_id, type, text) VALUES ($1, $2, $3) RETURNING *',
      [testId, type || 'single', text]
    )
    const question = qRes.rows[0]

    if (type !== 'open' && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]
        await pool.query(
          'INSERT INTO answers (question_id, text, is_correct, position) VALUES ($1, $2, $3, $4)',
          [question.id, opt.text, opt.isCorrect || false, i]
        )
      }
    }

    const full = await fetchTestWithQuestions(testId)
    const q    = full.questions.find((q) => q.id === question.id)
    res.status(201).json(q)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/tests/:id/questions/:qid  (admin)
const deleteQuestion = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM questions WHERE id = $1 AND test_id = $2',
      [req.params.qid, req.params.id]
    )
    if (!rowCount) return res.status(404).json({ message: 'Вопрос не найден' })
    res.json({ message: 'Вопрос удалён' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllTests, getTestById, createTest, updateTest, deleteTest, addQuestion, deleteQuestion }
