import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, AlertCircle, Eye, EyeOff, Check, Key, Search } from '@/components/ui/icons'
import { clsx } from '@/utils/helpers'

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading = false,
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400 shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-gray-300 shadow-sm',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-300',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400 shadow-sm',
    ghost:     'hover:bg-gray-100 text-gray-600 focus:ring-gray-300',
    gradient:  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 focus:ring-blue-400',
  }

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 18 : 15} /> : children}
    </button>
  )
})
Button.displayName = 'Button'

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default:  'bg-blue-50 text-blue-700',
    success:  'bg-emerald-50 text-emerald-700',
    warning:  'bg-amber-50 text-amber-700',
    danger:   'bg-red-50 text-red-600',
    purple:   'bg-purple-50 text-purple-700',
    gray:     'bg-gray-100 text-gray-600',
    indigo:   'bg-indigo-50 text-indigo-700',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, icon: Icon, suffix, className = '', containerClassName = '', ...props }, ref) => (
  <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={15} />
        </span>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full py-2.5 text-sm border rounded-xl bg-white transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent',
          Icon ? 'pl-9' : 'pl-3.5',
          suffix ? 'pr-10' : 'pr-3.5',
          error
            ? 'border-red-300 focus:ring-red-300 bg-red-50/30'
            : 'border-gray-200 focus:ring-blue-400',
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {suffix}
        </span>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
))
Input.displayName = 'Input'

// ── PasswordInput ─────────────────────────────────────────────────────────────
import { useState } from 'react'

export const PasswordInput = forwardRef(({ label, error, className = '', ...props }, ref) => {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Key size={15} /></span>
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={clsx(
            'w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl bg-white transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent',
            error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400',
            className
          )}
          {...props}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, className = '', rows = 3, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white resize-none transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent',
        error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, className = '', children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      ref={ref}
      className={clsx(
        'w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all',
        error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
))
Select.displayName = 'Select'

// ── Toggle ────────────────────────────────────────────────────────────────────
export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
        checked ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span className={clsx(
        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
        checked ? 'left-5' : 'left-1'
      )} />
    </button>
    {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
  </label>
)

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-white rounded-2xl border border-gray-100 shadow-card',
      hover && 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer',
      className
    )}
  >
    {children}
  </div>
)

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel, loading = false }) => {
  const { t } = useTranslation()

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
          {confirmLabel || t('delete')}
        </Button>
      </div>
    </Modal>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, className = '' }) => (
  <svg
    className={clsx('animate-spin text-current', className)}
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ── PageLoader ────────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size={32} className="text-blue-600" />
  </div>
)

// ── Empty ─────────────────────────────────────────────────────────────────────
export const Empty = ({ icon: Icon, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    {Icon && <Icon size={40} className="mb-3 opacity-30" />}
    <p className="font-medium text-gray-500">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
)

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple:  'bg-purple-50 text-purple-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-500',
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl flex-shrink-0', colors[color])}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = '#3b82f6', height = 6, className = '' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={clsx('bg-gray-100 rounded-full overflow-hidden', className)} style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder, className = '' }) => {
  const { t } = useTranslation()

  return (
    <div className={clsx('relative', className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `${t('search')}...`}
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
      />
    </div>
  )
}
