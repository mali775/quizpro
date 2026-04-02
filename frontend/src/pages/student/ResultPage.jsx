import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Award, XCircle, Check, X, ArrowLeft, Download, FileText, List, CheckSquare } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Button, Badge, Card, ProgressBar } from '@/components/ui'
import { exportElementToPDF, exportToCSV, clsx, toFileName } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const exportRef = useRef(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    if (!state?.result) {
      navigate('/student', { replace: true })
    }
  }, [navigate, state])

  if (!state?.result) {
    return null
  }

  const { result } = state
  const { score, maxScore, percentage, passed, answers = [], questions = [] } = result

  const handleExport = () => {
    const rows = [
      [t('question'), t('type'), t('yourAnswer'), t('correct')],
      ...questions.map((question) => {
        const answer = answers.find((item) => item.questionId === question.id)
        const answerText = Array.isArray(answer?.answer)
          ? answer.answer.map((id) => question.options?.find((option) => option.id === id)?.text || id).join('; ')
          : answer?.answer || ''

        return [question.text, question.type, answerText, answer?.isCorrect ? t('yes') : t('no')]
      }),
    ]

    exportToCSV(rows, 'result.csv')
    toast.success(t('exportDone'))
  }

  const handlePdfExport = async () => {
    setExportingPdf(true)

    try {
      await exportElementToPDF(exportRef.current, `${toFileName(`result-${result.id}`)}.pdf`)
      toast.success(t('exportDone'))
    } catch {
      toast.error(t('genericError'))
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div ref={exportRef} className="space-y-6">
          <Card className="relative overflow-hidden p-6 text-center sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5" />

            <div className={clsx(
              'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
              passed ? 'bg-emerald-100' : 'bg-red-100'
            )}>
              {passed
                ? <Award size={36} className="text-emerald-600" />
                : <XCircle size={36} className="text-red-500" />}
            </div>

            <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('testCompleted')}</h1>
            <p className="mb-6 text-sm text-gray-500">{t('answeredQuestionsCount', { count: questions.length })}</p>

            <div className="mb-1 flex items-end justify-center gap-1">
              <span className={clsx('text-5xl font-bold leading-none sm:text-7xl', passed ? 'text-emerald-600' : 'text-red-500')}>
                {percentage}
              </span>
              <span className={clsx('mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl', passed ? 'text-emerald-400' : 'text-red-400')}>%</span>
            </div>

            <p className="mb-4 text-sm text-gray-500">
              {t('scoreOutOf', { score, max: maxScore })}
            </p>

            <Badge variant={passed ? 'success' : 'danger'} className="px-4 py-1.5 text-sm">
              {passed ? <><Check size={14} />{t('passed')}</> : <><X size={14} />{t('failed')}</>}
            </Badge>

            <ProgressBar
              value={percentage}
              className="mx-auto mt-6 max-w-xs"
              height={8}
              color={passed ? '#10b981' : '#ef4444'}
            />
          </Card>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <List size={18} className="text-blue-600" /> {t('answerReview')}
            </h3>

            {questions.map((question, index) => {
              const answer = answers.find((item) => item.questionId === question.id)
              const isCorrect = answer?.isCorrect

              return (
                <Card
                  key={question.id}
                  className={clsx('border-l-4 p-5', isCorrect ? 'border-l-emerald-400' : 'border-l-red-400')}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span className={clsx(
                      'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                      isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                    )}>
                      {isCorrect ? <Check size={13} /> : <X size={13} />}
                    </span>
                    <div className="flex-1">
                      <p className="mb-0.5 text-xs text-gray-400">{t('question')} {index + 1}</p>
                      <p className="font-medium text-gray-800">{question.text}</p>
                    </div>
                  </div>

                  {question.type !== 'open' ? (
                    <div className="space-y-1.5 sm:pl-9">
                      {question.options.map((option) => {
                        const userChose = Array.isArray(answer?.answer) && answer.answer.includes(option.id)
                        const isRight = option.isCorrect

                        return (
                          <div
                            key={option.id}
                            className={clsx(
                              'flex flex-col gap-2 rounded-lg px-3 py-2 text-sm sm:flex-row sm:items-center',
                              isRight ? 'bg-emerald-50 font-medium text-emerald-700'
                                : userChose && !isRight ? 'bg-red-50 text-red-600'
                                : 'text-gray-500'
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className={clsx(
                                'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-white',
                                isRight ? 'border-emerald-500 bg-emerald-500' : userChose ? 'border-red-400 bg-red-400' : 'border-gray-200'
                              )}>
                                {(isRight || userChose) && <Check size={10} />}
                              </span>
                              <span className="break-words">{option.text}</span>
                            </div>

                            {isRight && (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 sm:ml-auto">
                                <CheckSquare size={10} />{t('correctAnswer')}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="sm:pl-9">
                      <p className="mb-1 text-xs text-gray-400">{t('yourAnswer')}</p>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm italic text-gray-700">
                        {answer?.answer || '-'}
                      </p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row" data-export-hidden="true">
          <Button variant="secondary" size="sm" onClick={handleExport} className="w-full justify-center sm:w-auto">
            <Download size={14} />{t('exportExcel')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePdfExport} loading={exportingPdf} className="w-full justify-center sm:w-auto">
            <FileText size={14} />{t('exportPDF')}
          </Button>
        </div>

        <Button variant="gradient" size="lg" className="mt-4 w-full" onClick={() => navigate('/student')}>
          <ArrowLeft size={16} /> {t('availableTests')}
        </Button>
      </div>
    </div>
  )
}
