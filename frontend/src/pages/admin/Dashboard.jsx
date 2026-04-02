import { useMemo } from 'react'
import { Users, BookOpen, Target, Bell, BarChart2, TrendingUp, Activity } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { db } from '@/services/mockDb'
import { Card, StatCard, Badge } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import LangSwitcher from '@/components/layout/LangSwitcher'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

export default function AdminDashboard() {
  const { t } = useTranslation()

  const users   = db.users.getAll()
  const tests   = db.tests.getAll()
  const results = db.results.getAll()

  const students = users.filter((u) => u.role === 'student')
  const approved = students.filter((u) => u.isApproved)
  const pending  = students.filter((u) => !u.isApproved)
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0

  const barData = useMemo(() =>
    tests.map((test) => {
      const tr = results.filter((r) => r.testId === test.id)
      return {
        name: test.title.split(' ').slice(0, 2).join(' '),
        attempts: tr.length,
        avg: tr.length ? Math.round(tr.reduce((s, r) => s + r.percentage, 0) / tr.length) : 0,
      }
    }), [tests, results])

  const pieData = [
    { name: t('passed'), value: results.filter((r) => r.passed).length, color: '#10b981' },
    { name: t('failed'), value: results.filter((r) => !r.passed).length, color: '#ef4444' },
  ]

  const recent = [...results]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 6)

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('overviewPlatform')}</p>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users}    label={t('totalStudents')}    value={approved.length} color="blue"   sub={t('pendingUsersShort', { count: pending.length })} />
        <StatCard icon={BookOpen} label={t('totalTests')}       value={tests.length}    color="purple" />
        <StatCard icon={Target}   label={t('avgScore')}         value={`${avgScore}%`}  color="emerald" />
        <StatCard icon={Bell}     label={t('pendingApprovals')} value={pending.length}  color="amber"  />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 size={17} className="text-blue-600" /> {t('testStats')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)' }} />
              <Legend />
              <Bar dataKey="attempts" name={t('attemptsLabel')} fill="#3b82f6" radius={[5, 5, 0, 0]} />
              <Bar dataKey="avg"      name={t('averagePercent')} fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={17} className="text-emerald-600" /> {t('passRate')}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
                <span className="font-semibold text-gray-700">{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent results table */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={17} className="text-purple-600" /> {t('recentActivity')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[t('studentLabel'), t('testLabel'), t('pointsLabel'), '%', t('status'), t('dateLabel')].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const u    = users.find((u) => u.id === r.userId)
                const test = tests.find((t) => t.id === r.testId)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">{u?.firstName} {u?.lastName}</td>
                    <td className="py-3 px-3 text-gray-600">{test?.title}</td>
                    <td className="py-3 px-3 font-semibold">{r.score}/{r.maxScore}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: r.percentage >= 70 ? '#10b981' : r.percentage >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="text-xs">{r.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? t('passed') : t('failed')}</Badge>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{formatDate(r.completedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
