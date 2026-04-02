import { Clock, LogOut } from '@/components/ui/icons'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import LangSwitcher from '@/components/layout/LangSwitcher'
import toast from 'react-hot-toast'

export default function PendingPage() {
  const { logout, user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast(t('logout'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="fixed left-4 right-4 top-4 sm:left-auto sm:right-4"><LangSwitcher /></div>
      <Card className="max-w-sm p-8 pt-20 text-center shadow-xl sm:p-10 sm:pt-10">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <Clock size={30} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('noAccess')}</h2>
        <p className="text-gray-500 text-sm mb-2">{t('waitingApproval')}</p>
        <p className="text-xs text-gray-400 mb-8">
          {t('accountLabel')}: <span className="font-medium text-gray-600">{user?.email}</span>
        </p>
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          <LogOut size={16} /> {t('logout')}
        </Button>
      </Card>
    </div>
  )
}
