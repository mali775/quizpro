const router  = require('express').Router()
const { body } = require('express-validator')
const { validate }        = require('../middleware/errorHandler')
const { authenticate, requireAdmin, requireApproved } = require('../middleware/auth')

const authCtrl   = require('../controllers/authController')
const userCtrl   = require('../controllers/userController')
const testCtrl   = require('../controllers/testController')
const resultCtrl = require('../controllers/resultController')

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register',
  [
    body('firstName').trim().notEmpty().withMessage('Имя обязательно'),
    body('lastName').trim().notEmpty().withMessage('Фамилия обязательна'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Минимум 6 символов'),
    validate,
  ],
  authCtrl.register
)

router.post('/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  authCtrl.login
)

router.get('/auth/me', authenticate, authCtrl.me)

// ── Users (admin) ─────────────────────────────────────────────────────────────
router.get   ('/users',             authenticate, requireAdmin, userCtrl.getAllUsers)
router.patch ('/users/:id/approve', authenticate, requireAdmin, userCtrl.approveUser)
router.patch ('/users/:id/reject',  authenticate, requireAdmin, userCtrl.rejectUser)

// ── Tests ─────────────────────────────────────────────────────────────────────
router.get ('/tests',     authenticate, requireApproved, testCtrl.getAllTests)
router.get ('/tests/:id', authenticate, requireApproved, testCtrl.getTestById)

// Admin-only mutations
router.post  ('/tests',                    authenticate, requireAdmin, testCtrl.createTest)
router.put   ('/tests/:id',                authenticate, requireAdmin, testCtrl.updateTest)
router.delete('/tests/:id',                authenticate, requireAdmin, testCtrl.deleteTest)
router.post  ('/tests/:id/questions',      authenticate, requireAdmin, testCtrl.addQuestion)
router.delete('/tests/:id/questions/:qid', authenticate, requireAdmin, testCtrl.deleteQuestion)

// ── Results ───────────────────────────────────────────────────────────────────
router.get ('/results',     authenticate, resultCtrl.getResults)
router.get ('/results/:id', authenticate, resultCtrl.getResultById)
router.post('/results',     authenticate, requireApproved, resultCtrl.submitResult)

module.exports = router
