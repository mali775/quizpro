import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from '@/components/ui/icons'
import { clsx } from '@/utils/helpers'

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'kz', label: 'Қазақша' },
  { code: 'en', label: 'English' },
]

export default function LangSwitcher({ className = '' }) {
  const { i18n } = useTranslation()

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('quizpro_lang', code)
  }

  return (
    <div className={clsx('relative w-full sm:w-auto', className)}>
      <div className="relative flex items-center rounded-2xl border border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-sm transition-all focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
        <div className="pointer-events-none flex items-center gap-2 border-r border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-2.5 text-blue-700 rounded-l-2xl">
          <Globe size={15} />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] sm:inline">Lang</span>
        </div>

        <select
          value={i18n.language}
          onChange={(e) => changeLang(e.target.value)}
          className="w-full min-w-0 appearance-none rounded-r-2xl bg-transparent py-2.5 pl-3 pr-10 text-sm font-medium text-gray-700 outline-none sm:min-w-[148px]"
          aria-label="Language"
        >
          {LANGS.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  )
}
