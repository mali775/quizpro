import { useState } from 'react'
import { UserCheck, UserX, Users, Clock, CheckCircle } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Button, Badge, Card, SearchInput, Empty, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { userService } from '@/services/userService'
import { formatDate } from '@/utils/helpers'
import LangSwitcher from '@/components/layout/LangSwitcher'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const { data: users, loading } = useAsync(() => userService.getAll(), [tick])

  const students = (users || []).filter(
    (u) => u.role === 'student' &&
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = async (id) => {
    await userService.approve(id)
    toast.success(t('approved'))
    refresh()
  }

  const handleReject = async (id) => {
    await userService.reject(id)
    toast.error(t('rejected'))
    refresh()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('registrationsSummary', {
              count: students.length,
              pending: (users || []).filter((u) => u.role === 'student' && !u.isApproved).length,
            })}
          </p>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder={t('searchByNameOrEmail')} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[t('studentLabel'), 'Email', t('dateCompleted'), t('status'), t('actionsLabel')].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3.5 px-4 text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.isApproved ? 'success' : 'warning'}>
                      {u.isApproved
                        ? <><CheckCircle size={10} />{t('approved')}</>
                        : <><Clock size={10} />{t('pending')}</>}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {!u.isApproved && (
                        <Button variant="success" size="sm" onClick={() => handleApprove(u.id)}>
                          <UserCheck size={13} />{t('approve')}
                        </Button>
                      )}
                      {u.isApproved && (
                        <Button variant="danger" size="sm" onClick={() => handleReject(u.id)}>
                          <UserX size={13} />{t('reject')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td colSpan={5} className="py-12">
                    <Empty icon={Users} message={t('noUsersYet')} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
