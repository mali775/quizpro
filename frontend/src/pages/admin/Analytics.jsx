import { useMemo } from 'react'
import { TrendingUp, Target, BarChart2 } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Card, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { resultService } from '@/services/resultService'
import { testService } from '@/services/testService'
import LangSwitcher from '@/components/layout/LangSwitcher'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'

export default function AdminAnalytics() {
  const { t } = useTranslation()
  const { data: results, loading } = useAsync(() => resultService.getAll(), [])
  const { data: tests }            = useAsync(() => testService.getAll(), [])

  const timelineData = useMemo(() =>
    (tests || []).map((test) => {
      const tr = (results || []).filter((r) => r.testId === test.id)
      return {
        name:   test.title.split(' ').slice(0, 2).join(' '),
        score:  tr.length ? Math.round(tr.reduce((s, r) => s + r.percentage, 0) / tr.length) : 0,
        passed: tr.filter((r) => r.passed).length,
        failed: tr.filter((r) => !r.passed).length,
      }
    }), [tests, results])

  const missedData = useMemo(() => {
    const items = []
    ;(tests || []).forEach((test) => {
      test.questions.forEach((q) => {
        const tr     = (results || []).filter((r) => r.testId === test.id)
        const missed = tr.filter((r) => {
          const a = r.answers.find((a) => a.questionId === q.id)
          return a && !a.isCorrect
        }).length
        if (missed > 0) items.push({ text: q.text.slice(0, 45) + '…', missed, total: tr.length })
      })
    })
    return items.sort((a, b) => b.missed - a.missed).slice(0, 7)
  }, [tests, results])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('detailedAnalytics')}</p>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart avg */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={17} className="text-blue-600" /> {t('averageScoreByTests')}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)' }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6' }} name={t('averagePercent')} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Most missed */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={17} className="text-red-500" /> {t('mostMissed')}
          </h3>
          {missedData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('noDataYet')}</p>
          ) : (
            <div className="space-y-3">
              {missedData.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-4 text-right mt-0.5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 mb-1 truncate">{item.text}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: item.total ? `${(item.missed / item.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{item.missed}/{item.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pass/fail bar */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 size={17} className="text-purple-600" /> {t('passedFailedByTests')}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Legend />
              <Bar dataKey="passed" name={t('passed')} fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="failed" name={t('failed')} fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
