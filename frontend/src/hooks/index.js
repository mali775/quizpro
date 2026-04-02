import { useState, useEffect, useCallback, useRef } from 'react'
import i18n from '@/i18n/i18n'

const getStoredDeadline = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') return null

  const storedValue = Number(localStorage.getItem(storageKey))
  if (!Number.isFinite(storedValue)) return null

  return storedValue
}

export const useTimer = ({ initialSeconds = 0, storageKey, onExpire, enabled = true }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, initialSeconds))
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  const clear = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }

    expiredRef.current = false
    setTimeLeft(0)
  }, [storageKey])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!enabled || initialSeconds <= 0) {
      setTimeLeft(Math.max(0, initialSeconds))
      expiredRef.current = false
      return
    }

    const syncTime = (deadline) => {
      const nextTimeLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(nextTimeLeft)

      if (nextTimeLeft > 0 || expiredRef.current) return false

      expiredRef.current = true
      if (storageKey) localStorage.removeItem(storageKey)
      onExpireRef.current?.()
      return true
    }

    const now = Date.now()
    const storedDeadline = getStoredDeadline(storageKey)
    const deadline = storedDeadline && storedDeadline > now
      ? storedDeadline
      : now + initialSeconds * 1000

    if (storageKey && (!storedDeadline || storedDeadline <= now)) {
      localStorage.setItem(storageKey, String(deadline))
    }

    expiredRef.current = false

    if (syncTime(deadline)) return

    const id = window.setInterval(() => {
      const didExpire = syncTime(deadline)
      if (didExpire) window.clearInterval(id)
    }, 250)

    return () => window.clearInterval(id)
  }, [enabled, initialSeconds, storageKey])

  return {
    timeLeft,
    clear,
  }
}

export const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((next) => {
    setValue((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {}
      return resolved
    })
  }, [key])

  const remove = useCallback(() => {
    setValue(initial)
    localStorage.removeItem(key)
  }, [key, initial])

  return [value, set, remove]
}

export const useAutoSave = (key, data, delay = 1500) => {
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setSaved(false)
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        setSaved(true)
      } catch {}
    }, delay)

    return () => clearTimeout(timerRef.current)
  }, [key, data, delay])

  return saved
}

export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

export const useAsync = (asyncFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      setError(err.message || i18n.t('genericError'))
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refetch: run }
}
