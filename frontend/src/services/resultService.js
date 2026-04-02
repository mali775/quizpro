import { db } from './mockDb'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

export const resultService = {
  getAll: async () => {
    await delay()
    return db.results.getAll()
  },

  getByUser: async (userId) => {
    await delay()
    return db.results.getByUser(Number(userId))
  },

  getByTest: async (testId) => {
    await delay()
    return db.results.getByTest(Number(testId))
  },

  submit: async (resultData) => {
    await delay(500)
    return db.results.create(resultData)
  },
}
