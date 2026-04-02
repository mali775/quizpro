import { db } from './mockDb'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

export const testService = {
  getAll: async () => {
    await delay()
    return db.tests.getAll()
  },

  getById: async (id) => {
    await delay()
    return db.tests.findById(Number(id))
  },

  create: async (data) => {
    await delay()
    return db.tests.create(data)
  },

  update: async (id, data) => {
    await delay()
    return db.tests.update(Number(id), data)
  },

  delete: async (id) => {
    await delay()
    db.tests.delete(Number(id))
  },

  addQuestion: async (testId, questionData) => {
    await delay()
    return db.tests.addQuestion(Number(testId), questionData)
  },

  deleteQuestion: async (testId, questionId) => {
    await delay()
    db.tests.deleteQuestion(Number(testId), Number(questionId))
  },
}
