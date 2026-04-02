import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('quizpro_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const currentUser = await authService.me()
        if (currentUser) {
          setUser(currentUser)
          localStorage.setItem('quizpro_user', JSON.stringify(currentUser))
        } else {
          setUser(null)
          setToken(null)
          localStorage.removeItem('quizpro_user')
          localStorage.removeItem('quizpro_token')
        }
      } catch {
        setUser(null)
        setToken(null)
        localStorage.removeItem('quizpro_user')
        localStorage.removeItem('quizpro_token')
      } finally {
        setLoading(false)
      }
    }

    bootstrapAuth()
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('quizpro_token', data.token)
    localStorage.setItem('quizpro_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData)
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('quizpro_token', data.token)
    localStorage.setItem('quizpro_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('quizpro_token')
    localStorage.removeItem('quizpro_user')
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('quizpro_user', JSON.stringify(updatedUser))
  }, [])

  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'
  const isApproved = user?.isApproved === true

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isAdmin, isStudent, isApproved,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
