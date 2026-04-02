import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, BarChart2, TrendingUp,
  GraduationCap, LogOut, ChevronLeft, ChevronRight, User,
  Shield, List, X,
} from '@/components/ui/icons'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { clsx } from '@/utils/helpers'
import toast from 'react-hot-toast'

const adminNav = [
  { to: '/admin',           icon: LayoutDashboard, labelKey: 'dashboard',  end: true },
  { to: '/admin/tests',     icon: BookOpen,         labelKey: 'tests' },
  { to: '/admin/users',     icon: Users,            labelKey: 'users' },
  { to: '/admin/results',   icon: BarChart2,        labelKey: 'results' },
  { to: '/admin/analytics', icon: TrendingUp,       labelKey: 'analytics' },
  { to: '/admin/profile',   icon: User,             labelKey: 'profile' },
]

const studentNav = [
  { to: '/student',         icon: List,             labelKey: 'availableTests', end: true },
  { to: '/student/results', icon: BarChart2,        labelKey: 'myResults' },
  { to: '/student/profile', icon: User,             labelKey: 'profile' },
]

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, isAdmin, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const nav = isAdmin ? adminNav : studentNav
  const showLabels = !collapsed || mobileOpen

  const handleLogout = () => {
    logout()
    onCloseMobile?.()
    navigate('/login')
    toast.success(t('logout'))
  }

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onCloseMobile}
      />

      <aside className={clsx(
        'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 lg:z-40 lg:shadow-sm',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-72 sm:w-80 lg:w-20' : 'w-72 sm:w-80 lg:w-60'
      )}>
        <div className={clsx('flex items-center border-b border-gray-100 px-4 py-5', collapsed ? 'lg:justify-center' : 'justify-between')}>
          <div className={clsx('flex min-w-0 items-center gap-3', collapsed && 'lg:gap-0')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-200">
              <GraduationCap size={18} className="text-white" />
            </div>
            {showLabels && <span className="truncate text-lg font-bold tracking-tight text-gray-900">QuizPro</span>}
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {nav.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                collapsed && 'lg:justify-center',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={clsx('flex-shrink-0', isActive ? 'text-blue-600' : '')} />
                  {showLabels && <span className="truncate">{t(labelKey)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-gray-100 p-3">
          {showLabels && (
            <div className="mb-1 flex items-center gap-3 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  {isAdmin ? <><Shield size={10} />{t('admin')}</> : <><GraduationCap size={10} />{t('student')}</>}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={clsx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:text-red-600',
              collapsed && 'lg:justify-center'
            )}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {showLabels && t('logout')}
          </button>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className={clsx(
              'hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 lg:flex',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>{t('collapse')}</span></>}
          </button>
        </div>
      </aside>
    </>
  )
}
