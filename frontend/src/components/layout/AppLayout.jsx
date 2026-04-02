import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from '@/components/ui/icons'
import { clsx } from '@/utils/helpers'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={clsx('min-h-screen transition-all duration-300', collapsed ? 'lg:ml-20' : 'lg:ml-60')}>
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-900">QuizPro</span>
          <span className="w-10" />
        </div>

        <main className="min-h-screen">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
