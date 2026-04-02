import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Timer, ArrowRight, ArrowLeft, CheckCircle, Lock,
  RefreshCw, Circle, CheckSquare, AlignLeft, Check, BookOpen,
} from '@/components/ui/icons'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button, Badge, Card, Spinner } from '@/components/ui'
import { useTimer, useLocalStorage, useAutoSave } from '@/hooks'
import { testService } from '@/services/testService'
import { resultService } from '@/services/resultService'
import { shuffle, formatTime, calcScore, clsx } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function TestPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const answerStorageKey = `quiz_${user.id}_${id}`
  const timerStorageKey = `quiz_timer_${user.id}_${id}`
  const [answers, setAnswers] = useLocalStorage(answerStorageKey, {})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [antiCheatMsg, setAntiCheatMsg] = useState(false)
  const submittedRef = useRef(false)
  const handleSubmitRef = useRef(() => {})

  useAutoSave(answerStorageKey, answers)

  useEffect(() => {
    testService.getById(id).then((nextTest) => {
      if (!nextTest) {
        navigate('/student')
        return
      }

      setTest(nextTest)
      setQuestions(nextTest.shuffleQuestions ? shuffle(nextTest.questions) : nextTest.questions)
      setLoading(false)
    })
  }, [id, navigate])

  const { timeLeft, clear: clearTimer } = useTimer({
    initialSeconds: (test?.timeLimit || 0) * 60,
    storageKey: timerStorageKey,
    onExpire: () => handleSubmitRef.current?.(),
    enabled: Boolean(test?.id),
  })

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !test) return

    submittedRef.current = true
    setSubmitting(true)

    const { score, maxScore, log } = calcScore(questions, answers)
    const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0
    const passed = percentage >= test.minPassScore

    try {
      const result = await resultService.submit({
        userId: user.id,
        testId: test.id,
        score,
        maxScore,
        percentage,
        passed,
        completedAt: new Date().toISOString(),
        answers: log,
      })

      localStorage.removeItem(answerStorageKey)
      clearTimer()

      navigate(`/student/result/${result.id}`, {
        state: {
          result: { ...result, questions },
        },
      })
    } catch (error) {
      toast.error(error.message)
      submittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [answerStorageKey, answers, clearTimer, navigate, questions, test, user.id])

  useEffect(() => {
    handleSubmitRef.current = handleSubmit
  }, [handleSubmit])

  const q = questions[current]

  const handleAnswer = (value) => {
    if (!q) return

    if (q.type === 'single') {
      setAnswers((prev) => ({ ...prev, [q.id]: [value] }))
      return
    }

    if (q.type === 'multiple') {
      setAnswers((prev) => {
        const currentValue = prev[q.id] || []
        const nextValue = currentValue.includes(value)
          ? currentValue.filter((item) => item !== value)
          : [...currentValue, value]

        return { ...prev, [q.id]: nextValue }
      })
      return
    }

    setAnswers((prev) => ({ ...prev, [q.id]: value }))
  }

  const tryGoBack = () => {
    setAntiCheatMsg(true)
    window.setTimeout(() => setAntiCheatMsg(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={36} className="text-blue-600" />
      </div>
    )
  }

  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0
  const timerWarning = timeLeft < 300
  const timerCritical = timeLeft < 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {antiCheatMsg && (
        <div className="fixed left-1/2 top-4 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-slide-up">
          <Lock size={15} /> {t('antiCheat')}
        </div>
      )}

      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen size={15} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{test?.title}</p>
              <p className="text-xs text-gray-400">{t('question')} {current + 1} {t('of')} {questions.length}</p>
            </div>
          </div>

          <div className={clsx(
            'flex items-center gap-1.5 self-start rounded-xl bg-gray-50 px-3 py-2 font-mono text-lg font-bold tabular-nums transition-colors sm:self-auto sm:text-xl',
            timerCritical ? 'animate-pulse text-red-600' : timerWarning ? 'text-amber-600' : 'text-gray-800'
          )}>
            <Timer size={18} className="flex-shrink-0" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="h-1 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {q && (
          <>
            <Card className="mb-6 p-5 sm:p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                  {current + 1}
                </span>
                <div>
                  <Badge
                    variant={q.type === 'single' ? 'default' : q.type === 'multiple' ? 'purple' : 'warning'}
                    className="mb-3"
                  >
                    {q.type === 'single'
                      ? <><Circle size={10} />{t('singleChoice')}</>
                      : q.type === 'multiple'
                        ? <><CheckSquare size={10} />{t('multipleChoice')}</>
                        : <><AlignLeft size={10} />{t('openQuestion')}</>}
                  </Badge>
                  <p className="text-lg font-medium leading-relaxed text-gray-900">{q.text}</p>
                </div>
              </div>

              {q.type === 'open' ? (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(event) => handleAnswer(event.target.value)}
                  placeholder={t('enterAnswer')}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                />
              ) : (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const selected = (answers[q.id] || []).includes(opt.id)

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswer(opt.id)}
                        className={clsx(
                          'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                          selected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                        )}
                      >
                        <span className={clsx(
                          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all',
                          selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                        )}>
                          {selected && <Check size={12} />}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>

            <div className="grid gap-3 lg:grid-cols-[auto,1fr,auto] lg:items-center">
              <Button variant="secondary" onClick={tryGoBack} disabled={current === 0} className="w-full justify-center lg:w-auto">
                <ArrowLeft size={16} /> {t('prevQuestion')}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/70 p-2.5 shadow-sm backdrop-blur">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => (index < current ? tryGoBack() : setCurrent(index))}
                    className={clsx(
                      'h-7 w-7 rounded-full text-xs font-semibold transition-all',
                      index === current
                        ? 'bg-blue-600 text-white shadow-sm'
                        : answers[questions[index].id]
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {current < questions.length - 1 ? (
                <Button variant="gradient" onClick={() => setCurrent(current + 1)} className="w-full justify-center lg:w-auto">
                  {t('nextQuestion')} <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="success" onClick={handleSubmit} loading={submitting} className="w-full justify-center lg:w-auto">
                  <CheckCircle size={16} /> {t('submitTest')}
                </Button>
              )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-gray-400">
              <RefreshCw size={10} /> {t('autoSaved')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
