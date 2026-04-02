import { useEffect, useMemo, useState } from 'react'
import { Mail, GraduationCap, Shield, PencilLine } from '@/components/ui/icons'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button, Input, Card, Badge } from '@/components/ui'
import LangSwitcher from '@/components/layout/LangSwitcher'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, isAdmin, updateUser } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    })
  }, [user])

  const initials = useMemo(
    () => `${form.firstName?.[0] || user?.firstName?.[0] || ''}${form.lastName?.[0] || user?.lastName?.[0] || ''}`,
    [form.firstName, form.lastName, user]
  )

  const setField = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleReset = () => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    })
    setErrors({})
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.firstName.trim()) nextErrors.firstName = t('requiredField')
    if (!form.lastName.trim()) nextErrors.lastName = t('requiredField')
    if (!form.email.trim()) nextErrors.email = t('requiredField')

    setErrors(nextErrors)
    return !Object.keys(nextErrors).length
  }

  const handleSave = async () => {
    if (!user?.id || !validate()) return

    setSaving(true)
    try {
      const updatedUser = await userService.updateProfile(user.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      })
      updateUser(updatedUser)
      toast.success(t('profileUpdated'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 page-enter max-w-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('profile')}</h1>
        </div>
        <LangSwitcher className="w-full sm:w-auto" />
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-200 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.firstName} {form.lastName}</h2>
            <p className="text-gray-500 text-sm">{form.email}</p>
            <Badge variant={isAdmin ? 'purple' : 'default'} className="mt-2">
              {isAdmin ? <><Shield size={10} />{t('admin')}</> : <><GraduationCap size={10} />{t('student')}</>}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PencilLine size={17} className="text-blue-600" /> {t('personalInfo')}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label={t('firstName')} value={form.firstName} onChange={setField('firstName')} error={errors.firstName} />
            <Input label={t('lastName')} value={form.lastName} onChange={setField('lastName')} error={errors.lastName} />
          </div>
          <Input label={t('email')} value={form.email} onChange={setField('email')} error={errors.email} icon={Mail} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
              {t('save')}
            </Button>
            <Button variant="secondary" onClick={handleReset} disabled={saving} className="w-full sm:w-auto">
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('language')}</h3>
        <LangSwitcher />
      </Card>
    </div>
  )
}
