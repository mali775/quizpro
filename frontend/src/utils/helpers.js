import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

export const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const m = Math.floor(safeSeconds / 60)
  const s = safeSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatDate = (iso) => {
  try {
    return format(new Date(iso), 'dd MMM yyyy', { locale: ru })
  } catch {
    return iso
  }
}


export const formatDateTime = (iso) => {
  try {
    return format(new Date(iso), 'dd MMM yyyy, HH:mm', { locale: ru })
  } catch {
    return iso
  }
}

export const clsx = (...classes) =>
  classes.filter(Boolean).join(' ')

export const scoreColor = (pct) => {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 60) return 'text-amber-600'
  return 'text-red-500'
}

export const scoreBg = (pct) => {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

export const exportToCSV = (rows, filename = 'export.csv') => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}

export const toFileName = (value, fallback = 'export') => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

export const exportElementToPDF = async (element, filename = 'export.pdf') => {
  if (!element) throw new Error('Export element is missing')

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(element, {
    backgroundColor: '#f8fafc',
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    ignoreElements: (node) => node?.dataset?.exportHidden === 'true',
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const margin = 24
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const renderWidth = pageWidth - margin * 2
  const renderHeight = (canvas.height * renderWidth) / canvas.width
  const pageContentHeight = pageHeight - margin * 2
  const image = canvas.toDataURL('image/png')

  let remainingHeight = renderHeight
  let offsetY = margin

  pdf.addImage(image, 'PNG', margin, offsetY, renderWidth, renderHeight, undefined, 'FAST')
  remainingHeight -= pageContentHeight

  while (remainingHeight > 0) {
    pdf.addPage()
    offsetY = margin - (renderHeight - remainingHeight)
    pdf.addImage(image, 'PNG', margin, offsetY, renderWidth, renderHeight, undefined, 'FAST')
    remainingHeight -= pageContentHeight
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

export const calcScore = (questions, answers) => {
  let score = 0
  const log = []

  questions.forEach((q) => {
    if (q.type === 'open') {
      const answered = !!(answers[q.id] && String(answers[q.id]).trim())
      if (answered) score++
      log.push({ questionId: q.id, answer: answers[q.id] || '', isCorrect: answered })
    } else {
      const given = [...(answers[q.id] || [])].sort((a, b) => a - b)
      const correct = q.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id)
        .sort((a, b) => a - b)
      const isCorrect = JSON.stringify(given) === JSON.stringify(correct)
      if (isCorrect) score++
      log.push({ questionId: q.id, answer: answers[q.id] || [], isCorrect })
    }
  })

  return { score, maxScore: questions.length, log }
}
