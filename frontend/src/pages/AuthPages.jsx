import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowRight, GraduationCap } from '@/components/ui/icons'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button, Input, PasswordInput, Card } from '@/components/ui'
import LangSwitcher from '@/components/layout/LangSwitcher'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = t('requiredField')
    if (!form.password) e.password = t('requiredField')
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`${t('welcomeBack')}, ${user.firstName}!`)
      navigate(user.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('login')}</h2>
      <p className="text-sm text-gray-500 mb-7">{t('enterAccountDetails')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('email')}
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <PasswordInput
          label={t('password')}
          placeholder="********"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <Button variant="gradient" size="lg" className="w-full mt-2" loading={loading} type="submit">
          {t('login')} <ArrowRight size={16} />
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('dontHaveAccount')}{' '}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">{t('register')}</Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-5 p-3.5 bg-blue-50 rounded-xl space-y-1.5">
        <p className="text-xs font-semibold text-blue-700">{t('demoAccess')}</p>
        <button
          type="button"
          onClick={() => setForm({ email: 'admin@quiz.com', password: 'admin123' })}
          className="block text-xs text-blue-600 hover:underline"
        >
          {t('demoAdmin')}: admin@quiz.com / admin123
        </button>
        <button
          type="button"
          onClick={() => setForm({ email: 'malika@gmail.com', password: 'pass123' })}
          className="block text-xs text-blue-600 hover:underline"
        >
          {t('demoStudent')}: malika@gmail.com / pass123
        </button>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.firstName) e.firstName = t('requiredField')
    if (!form.lastName) e.lastName = t('requiredField')
    if (!form.email) e.email = t('requiredField')
    if (!form.password || form.password.length < 6) e.password = t('minSixCharacters')
    if (form.password !== form.confirm) e.confirm = t('passwordsDontMatch')
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form)
      toast.success(t('registerSuccess'))
      navigate('/pending')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('register')}</h2>
      <p className="text-sm text-gray-500 mb-7">{t('createNewAccount')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label={t('firstName')} placeholder={t('firstName')} value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
          <Input label={t('lastName')} placeholder={t('lastName')} value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
        </div>
        <Input label={t('email')} type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} />
        <PasswordInput label={t('password')} placeholder={t('minSixCharacters')} value={form.password} onChange={set('password')} error={errors.password} />
        <PasswordInput label={t('passwordConfirm')} placeholder="********" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button variant="gradient" size="lg" className="w-full mt-2" loading={loading} type="submit">
          {t('register')} <ArrowRight size={16} />
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('haveAccount')}{' '}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">{t('login')}</Link>
      </p>
    </AuthLayout>
  )
}

// Shared auth shell
function AuthLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="fixed left-4 right-4 top-4 sm:left-auto sm:right-4">
        <LangSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 pt-16 text-center sm:pt-0">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">QuizPro</span>
          </div>
          <p className="text-gray-500 text-sm">{t('platformSubtitle')}</p>
        </div>
        <Card className="p-6 shadow-xl shadow-blue-100/50 sm:p-8">
          {children}
        </Card>
      </div>
    </div>
  )
}
