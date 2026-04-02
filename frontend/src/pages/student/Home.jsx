import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Timer, FileText, Zap, PlayCircle, Lock, Award, XCircle } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { Button, Badge, Card, SearchInput, Empty, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { testService } from '@/services/testService'
import { resultService } from '@/services/resultService'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default function StudentHome() {
  const { user } = useAuth()
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: tests,   loading: tLoad } = useAsync(() => testService.getAll(), [])
  const { data: results, loading: rLoad } = useAsync(() => resultService.getByUser(user.id), [])

  const filtered = (tests || []).filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  if (tLoad || rLoad) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('welcomeBack')}, {user.firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('availableTests')}</p>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder={t('searchTestsPlaceholder')} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((test) => {
          const myResults   = (results || []).filter((r) => r.testId === test.id)
          const attemptsLeft = test.attempts - myResults.length
          const lastResult  = [...myResults].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]

          return (
            <Card key={test.id} className="p-5 flex flex-col hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BookMarked size={18} className="text-white" />
                </div>
                {lastResult && (
                  <Badge variant={lastResult.passed ? 'success' : 'danger'}>
                    {lastResult.passed ? <><Award size={10} />{lastResult.percentage}%</> : <><XCircle size={10} />{lastResult.percentage}%</>}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{test.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{test.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="default"><Timer size={10} />{test.timeLimit} {t('minutes')}</Badge>
                <Badge variant="gray"><FileText size={10} />{t('questionsShort', { count: test.questions.length })}</Badge>
                <Badge variant={attemptsLeft > 0 ? 'purple' : 'danger'}>
                  <Zap size={10} />{attemptsLeft > 0 ? t('attemptsShort', { count: attemptsLeft }) : t('noAttemptsLeft')}
                </Badge>
              </div>

              <Button
                variant={attemptsLeft > 0 ? 'gradient' : 'secondary'}
                className="w-full"
                disabled={attemptsLeft <= 0}
                onClick={() => navigate(`/student/test/${test.id}`)}
              >
                {attemptsLeft > 0
                  ? <><PlayCircle size={16} />{t('startTest')}</>
                  : <><Lock size={16} />{t('noAttemptsLeft')}</>}
              </Button>
            </Card>
          )
        })}

        {!filtered.length && (
          <div className="col-span-3">
            <Empty icon={BookMarked} message={t('noTests')} />
          </div>
        )}
      </div>
    </div>
  )
}
