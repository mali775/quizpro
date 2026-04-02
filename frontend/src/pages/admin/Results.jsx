import { useState } from 'react'
import { Download, BarChart2 } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Button, Badge, Card, SearchInput, Empty, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { resultService } from '@/services/resultService'
import { userService } from '@/services/userService'
import { testService } from '@/services/testService'
import { formatDate, exportToCSV } from '@/utils/helpers'
import LangSwitcher from '@/components/layout/LangSwitcher'
import toast from 'react-hot-toast'

export default function AdminResults() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [filterTest, setFilterTest] = useState('all')

  const { data: results, loading: rLoad } = useAsync(() => resultService.getAll(), [])
  const { data: users }   = useAsync(() => userService.getAll(), [])
  const { data: tests }   = useAsync(() => testService.getAll(), [])

  const filtered = (results || []).filter((r) => {
    const u = (users || []).find((u) => u.id === r.userId)
    const matchSearch = `${u?.firstName} ${u?.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchTest   = filterTest === 'all' || r.testId === Number(filterTest)
    return matchSearch && matchTest
  })

  const handleExport = () => {
    const rows = [
      [t('studentLabel'), t('testLabel'), t('score'), t('total'), '%', t('status'), t('dateLabel')],
      ...filtered.map((r) => {
        const u    = (users || []).find((u) => u.id === r.userId)
        const test = (tests || []).find((t) => t.id === r.testId)
        return [
          `${u?.firstName} ${u?.lastName}`,
          test?.title || '',
          r.score,
          r.maxScore,
          `${r.percentage}%`,
          r.passed ? t('passed') : t('failed'),
          formatDate(r.completedAt),
        ]
      }),
    ]
    exportToCSV(rows, 'results.csv')
    toast.success(t('exportDone'))
  }

  if (rLoad) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('results')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('recordsCount', { count: filtered.length })}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <LangSwitcher className="w-full sm:w-auto" />
          <Button variant="secondary" size="sm" onClick={handleExport} className="w-full justify-center sm:w-auto">
            <Download size={15} />{t('exportExcel')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder={t('searchByStudentPlaceholder')} className="flex-1" />
        <select
          value={filterTest}
          onChange={(e) => setFilterTest(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 lg:w-64"
        >
          <option value="all">{t('allTestsOption')}</option>
          {(tests || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[t('studentLabel'), t('testLabel'), t('score'), t('percentage'), t('status'), t('dateLabel')].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const u = (users || []).find((u) => u.id === r.userId)
                const test = (tests || []).find((t) => t.id === r.testId)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-800">{u?.firstName} {u?.lastName}</td>
                    <td className="py-3.5 px-4 text-gray-600">{test?.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800">{r.score}</span>
                      <span className="text-gray-400">/{r.maxScore}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.percentage}%`, background: r.percentage >= 70 ? '#10b981' : r.percentage >= 50 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                        <span className="text-xs font-medium">{r.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? t('passed') : t('failed')}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{formatDate(r.completedAt)}</td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={6} className="py-12"><Empty icon={BarChart2} message={t('noResults')} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
