import { useState } from 'react'
import { Plus, Edit3, Trash2, List, Timer, Zap, Target, RefreshCw, Search, BookOpen, Check, Circle, CheckSquare, AlignLeft, X } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { db } from '@/services/mockDb'
import {
  Button, Badge, Card, Modal, ConfirmModal,
  Input, Textarea, Toggle, SearchInput, Empty, PageLoader,
} from '@/components/ui'
import { useAsync } from '@/hooks'
import { testService } from '@/services/testService'
import { resultService } from '@/services/resultService'
import toast from 'react-hot-toast'
import LangSwitcher from '@/components/layout/LangSwitcher'

// ── Question type pill ────────────────────────────────────────────────────────
const TYPE_LABELS = {
  single:   { labelKey: 'singleChoice',   icon: Circle,      variant: 'default' },
  multiple: { labelKey: 'multipleChoice', icon: CheckSquare, variant: 'purple' },
  open:     { labelKey: 'openQuestion',   icon: AlignLeft,   variant: 'warning' },
}

// ── Test Form Modal ───────────────────────────────────────────────────────────
function TestFormModal({ open, onClose, editData, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(editData || {
    title: '', description: '', timeLimit: 30, attempts: 3, minPassScore: 60, shuffleQuestions: true,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))
  const setE = (field) => (e) => set(field)(field === 'title' || field === 'description' ? e.target.value : Number(e.target.value))

  const validate = () => {
    const e = {}
    if (!form.title) e.title = t('requiredField')
    if (form.timeLimit < 1) e.timeLimit = t('minOneMinute')
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (editData) {
        await testService.update(editData.id, form)
        toast.success(t('testUpdated'))
      } else {
        await testService.create(form)
        toast.success(t('testCreated'))
      }
      onSave()
      onClose()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? t('editTest') : t('createTest')} size="lg">
      <div className="space-y-4">
        <Input label={t('title')} value={form.title} onChange={setE('title')} error={errors.title} placeholder={t('testTitlePlaceholder')} />
        <Textarea label={t('description')} value={form.description} onChange={(e) => set('description')(e.target.value)} placeholder={t('testDescriptionPlaceholder')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label={t('timeLimit')} type="number" min={1} value={form.timeLimit} onChange={setE('timeLimit')} error={errors.timeLimit} />
          <Input label={t('attempts')} type="number" min={1} value={form.attempts} onChange={setE('attempts')} />
          <Input label={t('minPassScore')} type="number" min={0} max={100} value={form.minPassScore} onChange={setE('minPassScore')} />
        </div>
        <Toggle checked={form.shuffleQuestions} onChange={set('shuffleQuestions')} label={t('shuffleQuestions')} />
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="gradient" className="flex-1" onClick={handleSave} loading={loading}>
            <Check size={15} /> {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Questions Modal ───────────────────────────────────────────────────────────
function QuestionsModal({ open, onClose, test, onSave }) {
  const { t } = useTranslation()
  const EMPTY_Q = { type: 'single', text: '', options: [
    { text: '', isCorrect: false }, { text: '', isCorrect: false },
    { text: '', isCorrect: false }, { text: '', isCorrect: false },
  ] }
  const [qForm, setQForm] = useState(EMPTY_Q)
  const [saving, setSaving] = useState(false)

  if (!test) return null

  const setType = (type) => setQForm({ ...EMPTY_Q, type })

  const toggleOption = (i) => {
    const opts = qForm.options.map((o, j) => ({
      ...o,
      isCorrect: qForm.type === 'single' ? j === i : j === i ? !o.isCorrect : o.isCorrect,
    }))
    setQForm({ ...qForm, options: opts })
  }

  const updateOption = (i, val) => {
    const opts = [...qForm.options]
    opts[i] = { ...opts[i], text: val }
    setQForm({ ...qForm, options: opts })
  }

  const handleAdd = async () => {
    if (!qForm.text.trim()) return toast.error(t('questionTextRequired'))
    setSaving(true)
    try {
      await testService.addQuestion(test.id, qForm)
      setQForm(EMPTY_Q)
      onSave()
      toast.success(t('questionAdded'))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDel = async (qId) => {
    await testService.deleteQuestion(test.id, qId)
    onSave()
    toast.success(t('questionDeleted'))
  }

  return (
    <Modal open={open} onClose={onClose} title={t('questionsForTest', { title: test.title })} size="xl">
      <div className="space-y-5">
        {test.questions.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {test.questions.map((q, i) => {
              const type = TYPE_LABELS[q.type]
              return (
                <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{q.text}</p>
                    <Badge variant={type.variant} className="text-xs">
                      <type.icon size={10} />{t(type.labelKey)}
                    </Badge>
                  </div>
                  <button onClick={() => handleDel(q.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-2 border-dashed border-blue-100 rounded-xl p-4 space-y-4 bg-blue-50/30">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Plus size={15} className="text-blue-600" />{t('addQuestionTitle')}</p>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(TYPE_LABELS).map(([val, { labelKey, icon: Icon }]) => (
              <button
                key={val}
                onClick={() => setType(val)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${qForm.type === val ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
              >
                <Icon size={12} />{t(labelKey)}
              </button>
            ))}
          </div>

          <Textarea label={t('questionText')} value={qForm.text} onChange={(e) => setQForm({ ...qForm, text: e.target.value })} placeholder={t('questionTextRequired')} rows={2} />

          {qForm.type !== 'open' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">{t('answerOptionsLabel')}</label>
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOption(i)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-400'}`}
                  >
                    {opt.isCorrect && <Check size={11} />}
                  </button>
                  <input
                    value={opt.text}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={t('optionPlaceholder', { count: i + 1 })}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          <Button variant="success" size="sm" onClick={handleAdd} loading={saving}>
            <Plus size={14} /> {t('addQuestion')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Tests Page ───────────────────────────────────────────────────────────
export default function AdminTests() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [showQ, setShowQ] = useState(false)
  const [activeTest, setActiveTest] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [delLoading, setDelLoading] = useState(false)
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const { data: tests, loading } = useAsync(() => testService.getAll(), [tick])
  const { data: results } = useAsync(() => resultService.getAll(), [tick])

  const filtered = (tests || []).filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditData(null); setShowForm(true) }
  const openEdit   = (test) => { setEditData(test); setShowForm(true) }
  const openQ      = (test) => { setActiveTest(test); setShowQ(true) }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await testService.delete(confirmDel)
      toast.success(t('testDeleted'))
      refresh()
    } finally {
      setDelLoading(false)
      setConfirmDel(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('tests')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('testsCount', { count: (tests || []).length })}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <LangSwitcher className="w-full sm:w-auto" />
          <Button variant="gradient" onClick={openCreate} className="w-full justify-center sm:w-auto"><Plus size={16} />{t('createTest')}</Button>
        </div>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder={t('searchTestsPlaceholder')} />

      <div className="grid gap-4">
        {filtered.map((test) => {
          const attempts = (results || []).filter((r) => r.testId === test.id).length
          return (
            <Card key={test.id} className="p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-900">{test.title}</h3>
                    <Badge variant="default">{t('questionsShort', { count: test.questions.length })}</Badge>
                    <Badge variant="purple"><Timer size={10} />{test.timeLimit} {t('minutes')}</Badge>
                    <Badge variant="gray"><Zap size={10} />{t('attemptsShort', { count: test.attempts })}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{test.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Target size={11} />{t('minPassShort', { count: test.minPassScore })}</span>
                    <span className="flex items-center gap-1"><RefreshCw size={11} />{test.shuffleQuestions ? t('shuffled') : t('inOrder')}</span>
                    <span>{t('completedAttempts', { count: attempts })}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row xl:flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openQ(test)} className="justify-center"><List size={14} />{t('questions')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(test)}><Edit3 size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => setConfirmDel(test.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </Card>
          )
        })}
        {!filtered.length && <Empty icon={BookOpen} message={t('noTests')} action={<Button variant="gradient" onClick={openCreate}><Plus size={15} />{t('firstTestAction')}</Button>} />}
      </div>

      <TestFormModal open={showForm} onClose={() => setShowForm(false)} editData={editData} onSave={refresh} />
      <QuestionsModal
        open={showQ}
        onClose={() => { setShowQ(false); setActiveTest(null) }}
        test={activeTest ? (tests || []).find((t) => t.id === activeTest.id) || activeTest : null}
        onSave={refresh}
      />
      <ConfirmModal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title={t('deleteTestTitle')}
        message={t('deleteTestMessage')}
        loading={delLoading}
      />
    </div>
  )
}
