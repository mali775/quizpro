import { BarChart2, Award, XCircle, Percent, CheckCircle } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { Badge, Card, StatCard, Empty, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { resultService } from '@/services/resultService'
import { testService } from '@/services/testService'
import { formatDate } from '@/utils/helpers'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default function StudentResults() {
  const { user } = useAuth()
  const { t }    = useTranslation()

  const { data: results, loading: rLoad } = useAsync(() => resultService.getByUser(user.id), [])
  const { data: tests,   loading: tLoad } = useAsync(() => testService.getAll(), [])

  const sorted = [...(results || [])].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

  if (rLoad || tLoad) return <PageLoader />

  const avgScore = sorted.length ? Math.round(sorted.reduce((s, r) => s + r.percentage, 0) / sorted.length) : 0

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('myResults')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('attemptsCount', { count: sorted.length })}</p>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      {sorted.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={CheckCircle} label={t('passed')}   value={sorted.filter((r) => r.passed).length}   color="emerald" />
          <StatCard icon={XCircle}     label={t('failed')}   value={sorted.filter((r) => !r.passed).length}  color="amber" />
          <StatCard icon={Percent}     label={t('avgScore')} value={`${avgScore}%`}                          color="blue" />
        </div>
      )}

      <div className="grid gap-4">
        {sorted.map((r) => {
          const test = (tests || []).find((t) => t.id === r.testId)
          return (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {r.passed
                      ? <Award size={22} className="text-emerald-600" />
                      : <XCircle size={22} className="text-red-500" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{test?.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.completedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{r.percentage}%</p>
                    <p className="text-xs text-gray-400">{r.score}/{r.maxScore}</p>
                  </div>
                  <Badge variant={r.passed ? 'success' : 'danger'}>
                    {r.passed ? t('passed') : t('failed')}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        })}
        {!sorted.length && <Empty icon={BarChart2} message={t('noResults')} />}
      </div>
    </div>
  )
}
