import axios from 'axios'
import i18n from '@/i18n/i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

const getErrorMessage = (error, fallbackKey = 'unexpectedError') =>
  error?.response?.data?.message || i18n.t(fallbackKey)

export const authService = {
  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'invalidCredentials'))
    }
  },

  register: async ({ firstName, lastName, email, password }) => {
    try {
      const { data } = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'emailAlreadyUsed'))
    }
  },

  me: async () => {
    try {
      const token = localStorage.getItem('quizpro_token')
      if (!token) return null

      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    } catch {
      return null
    }
  },
}
