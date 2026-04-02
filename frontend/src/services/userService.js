import axios from 'axios'
import i18n from '@/i18n/i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

const getAuthConfig = () => {
  const token = localStorage.getItem('quizpro_token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

const getErrorMessage = (error, fallbackKey = 'genericError') =>
  error?.response?.data?.message || i18n.t(fallbackKey)

export const userService = {
  getAll: async () => {
    try {
      const { data } = await api.get('/users', getAuthConfig())
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  approve: async (userId) => {
    try {
      const { data } = await api.patch(`/users/${userId}/approve`, {}, getAuthConfig())
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  reject: async (userId) => {
    try {
      const { data } = await api.patch(`/users/${userId}/reject`, {}, getAuthConfig())
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  updateProfile: async (userId, data) => {
    const currentUserRaw = localStorage.getItem('quizpro_user')
    if (!currentUserRaw) {
      throw new Error(i18n.t('userNotFound'))
    }

    const currentUser = JSON.parse(currentUserRaw)
    if (Number(currentUser.id) !== Number(userId)) {
      throw new Error(i18n.t('userNotFound'))
    }

    const updatedUser = {
      ...currentUser,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    }

    localStorage.setItem('quizpro_user', JSON.stringify(updatedUser))
    return updatedUser
  },
}
