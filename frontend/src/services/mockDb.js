const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return 'ru'
  return localStorage.getItem('quizpro_lang') || 'ru'
}

const pickLocalized = (value, lang = getCurrentLanguage()) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  return value[lang] ?? value.ru ?? Object.values(value)[0]
}

const localizeQuestion = (question, lang = getCurrentLanguage()) => ({
  ...question,
  text: pickLocalized(question.text, lang),
  options: (question.options || []).map((option) => ({
    ...option,
    text: pickLocalized(option.text, lang),
  })),
})

const localizeTest = (test, lang = getCurrentLanguage()) => ({
  ...test,
  title: pickLocalized(test.title, lang),
  description: pickLocalized(test.description, lang),
  questions: (test.questions || []).map((question) => localizeQuestion(question, lang)),
})

// Mock in-memory database. Replace with real API calls in production.
export let users = [
  { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@quiz.com', password: 'admin123', role: 'admin', isApproved: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, firstName: 'Aliya', lastName: 'Seitova', email: 'aliya@student.com', password: 'pass123', role: 'student', isApproved: true, createdAt: '2024-01-05T00:00:00Z' },
  { id: 3, firstName: 'Maksim', lastName: 'Petrov', email: 'maxim@student.com', password: 'pass123', role: 'student', isApproved: false, createdAt: '2024-01-08T00:00:00Z' },
  { id: 4, firstName: 'Dana', lastName: 'Nurova', email: 'dana@student.com', password: 'pass123', role: 'student', isApproved: true, createdAt: '2024-01-10T00:00:00Z' },
  { id: 5, firstName: 'Ivan', lastName: 'Kozlov', email: 'ivan@student.com', password: 'pass123', role: 'student', isApproved: false, createdAt: '2024-01-12T00:00:00Z' },
]

export let tests = [
  {
    id: 1,
    title: {
      ru: 'Основы JavaScript',
      en: 'JavaScript Basics',
      kz: 'JavaScript негіздері',
    },
    description: {
      ru: 'Базовые концепции JavaScript: переменные, функции и объекты.',
      en: 'Core JavaScript concepts: variables, functions, and objects.',
      kz: 'JavaScript-тің негізгі ұғымдары: айнымалылар, функциялар және объектілер.',
    },
    timeLimit: 30,
    attempts: 3,
    minPassScore: 60,
    shuffleQuestions: true,
    createdAt: '2024-01-15T00:00:00Z',
    questions: [
      {
        id: 1,
        testId: 1,
        type: 'single',
        text: {
          ru: 'Что такое замыкание в JavaScript?',
          en: 'What is a closure in JavaScript?',
          kz: 'JavaScript-тегі closure деген не?',
        },
        options: [
          { id: 1, text: { ru: 'Функция внутри функции', en: 'A function inside another function', kz: 'Функцияның ішіндегі функция' }, isCorrect: false },
          { id: 2, text: { ru: 'Функция с доступом к переменным внешней области', en: 'A function that keeps access to outer-scope variables', kz: 'Сыртқы аймақ айнымалыларына қолжетімді функция' }, isCorrect: true },
          { id: 3, text: { ru: 'Анонимная функция', en: 'An anonymous function', kz: 'Анонимді функция' }, isCorrect: false },
          { id: 4, text: { ru: 'Стрелочная функция', en: 'An arrow function', kz: 'Көрсеткі функция' }, isCorrect: false },
        ],
      },
      {
        id: 2,
        testId: 1,
        type: 'multiple',
        text: {
          ru: 'Какие типы данных являются примитивами в JavaScript?',
          en: 'Which data types are primitives in JavaScript?',
          kz: 'JavaScript-тегі қандай дерек түрлері примитивтерге жатады?',
        },
        options: [
          { id: 5, text: 'String', isCorrect: true },
          { id: 6, text: 'Array', isCorrect: false },
          { id: 7, text: 'Number', isCorrect: true },
          { id: 8, text: 'Boolean', isCorrect: true },
          { id: 9, text: 'Object', isCorrect: false },
        ],
      },
      {
        id: 3,
        testId: 1,
        type: 'single',
        text: {
          ru: 'Что возвращает `typeof null`?',
          en: 'What does `typeof null` return?',
          kz: '`typeof null` не қайтарады?',
        },
        options: [
          { id: 10, text: 'null', isCorrect: false },
          { id: 11, text: 'undefined', isCorrect: false },
          { id: 12, text: 'object', isCorrect: true },
          { id: 13, text: 'string', isCorrect: false },
        ],
      },
      {
        id: 4,
        testId: 1,
        type: 'open',
        text: {
          ru: 'Что такое hoisting в JavaScript? Объясните своими словами.',
          en: 'What is hoisting in JavaScript? Explain it in your own words.',
          kz: 'JavaScript-тегі hoisting деген не? Өз сөзіңізбен түсіндіріңіз.',
        },
        options: [],
      },
      {
        id: 5,
        testId: 1,
        type: 'single',
        text: {
          ru: 'Какой метод добавляет элемент в конец массива?',
          en: 'Which method adds an element to the end of an array?',
          kz: 'Массивтің соңына элементті қай әдіс қосады?',
        },
        options: [
          { id: 14, text: 'push()', isCorrect: true },
          { id: 15, text: 'pop()', isCorrect: false },
          { id: 16, text: 'shift()', isCorrect: false },
          { id: 17, text: 'unshift()', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 2,
    title: {
      ru: 'React и хуки',
      en: 'React and Hooks',
      kz: 'React және хуктар',
    },
    description: {
      ru: 'useState, useEffect, useContext и кастомные хуки.',
      en: 'useState, useEffect, useContext, and custom hooks.',
      kz: 'useState, useEffect, useContext және кастомды хуктар.',
    },
    timeLimit: 45,
    attempts: 2,
    minPassScore: 70,
    shuffleQuestions: true,
    createdAt: '2024-01-20T00:00:00Z',
    questions: [
      {
        id: 6,
        testId: 2,
        type: 'single',
        text: {
          ru: 'Для чего используется хук `useEffect`?',
          en: 'What is the `useEffect` hook used for?',
          kz: '`useEffect` хугы не үшін қолданылады?',
        },
        options: [
          { id: 18, text: { ru: 'Для управления состоянием', en: 'For managing state', kz: 'Күйді басқару үшін' }, isCorrect: false },
          { id: 19, text: { ru: 'Для side effects и жизненного цикла', en: 'For side effects and lifecycle logic', kz: 'Side effect пен lifecycle логикасы үшін' }, isCorrect: true },
          { id: 20, text: { ru: 'Для refs', en: 'For refs', kz: 'Refs үшін' }, isCorrect: false },
          { id: 21, text: { ru: 'Для контекста', en: 'For context', kz: 'Контекст үшін' }, isCorrect: false },
        ],
      },
      {
        id: 7,
        testId: 2,
        type: 'multiple',
        text: {
          ru: 'Что вызывает повторный рендер компонента?',
          en: 'What causes a component to re-render?',
          kz: 'Компоненттің қайта рендерленуіне не себеп болады?',
        },
        options: [
          { id: 22, text: { ru: 'Изменение state', en: 'State changes', kz: 'State өзгеруі' }, isCorrect: true },
          { id: 23, text: { ru: 'Изменение props', en: 'Props changes', kz: 'Props өзгеруі' }, isCorrect: true },
          { id: 24, text: { ru: 'Изменение CSS', en: 'CSS changes', kz: 'CSS өзгеруі' }, isCorrect: false },
          { id: 25, text: { ru: 'Изменение context', en: 'Context changes', kz: 'Context өзгеруі' }, isCorrect: true },
        ],
      },
      {
        id: 8,
        testId: 2,
        type: 'single',
        text: {
          ru: 'Что такое Virtual DOM?',
          en: 'What is the Virtual DOM?',
          kz: 'Virtual DOM деген не?',
        },
        options: [
          { id: 26, text: { ru: 'Реальный DOM браузера', en: 'The real browser DOM', kz: 'Браузердің нақты DOM-ы' }, isCorrect: false },
          { id: 27, text: { ru: 'JavaScript-представление DOM в памяти', en: 'A JavaScript representation of the DOM in memory', kz: 'DOM-ның жадтағы JavaScript көрінісі' }, isCorrect: true },
          { id: 28, text: { ru: 'HTML-шаблон', en: 'An HTML template', kz: 'HTML үлгісі' }, isCorrect: false },
          { id: 29, text: { ru: 'CSS-модель', en: 'A CSS model', kz: 'CSS моделі' }, isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 3,
    title: {
      ru: 'CSS и Tailwind',
      en: 'CSS and Tailwind',
      kz: 'CSS және Tailwind',
    },
    description: {
      ru: 'Flexbox, Grid, адаптивность и Tailwind CSS.',
      en: 'Flexbox, Grid, responsiveness, and Tailwind CSS.',
      kz: 'Flexbox, Grid, адаптивтілік және Tailwind CSS.',
    },
    timeLimit: 20,
    attempts: 5,
    minPassScore: 50,
    shuffleQuestions: false,
    createdAt: '2024-02-01T00:00:00Z',
    questions: [
      {
        id: 9,
        testId: 3,
        type: 'single',
        text: {
          ru: 'Какое свойство центрирует элементы по вертикали во Flexbox?',
          en: 'Which property centers items vertically in Flexbox?',
          kz: 'Flexbox-та элементтерді тігінен қай қасиет ортаға туралайды?',
        },
        options: [
          { id: 30, text: 'justify-content', isCorrect: false },
          { id: 31, text: 'align-items', isCorrect: true },
          { id: 32, text: 'vertical-align', isCorrect: false },
          { id: 33, text: 'margin: auto', isCorrect: false },
        ],
      },
      {
        id: 10,
        testId: 3,
        type: 'multiple',
        text: {
          ru: 'Какие единицы измерения являются относительными?',
          en: 'Which CSS units are relative?',
          kz: 'Қандай CSS өлшем бірліктері салыстырмалы болып саналады?',
        },
        options: [
          { id: 34, text: 'em', isCorrect: true },
          { id: 35, text: 'px', isCorrect: false },
          { id: 36, text: 'rem', isCorrect: true },
          { id: 37, text: '%', isCorrect: true },
          { id: 38, text: 'pt', isCorrect: false },
        ],
      },
    ],
  },
]

export let results = [
  { id: 1, userId: 2, testId: 1, score: 4, maxScore: 5, percentage: 80, passed: true, completedAt: '2024-02-10T10:30:00Z', answers: [{ questionId: 1, answer: [2], isCorrect: true }, { questionId: 2, answer: [5, 7, 8], isCorrect: true }, { questionId: 3, answer: [12], isCorrect: true }, { questionId: 4, answer: 'Hoisting moves declarations to the top of their scope.', isCorrect: true }, { questionId: 5, answer: [15], isCorrect: false }] },
  { id: 2, userId: 4, testId: 1, score: 3, maxScore: 5, percentage: 60, passed: true, completedAt: '2024-02-11T14:00:00Z', answers: [{ questionId: 1, answer: [1], isCorrect: false }, { questionId: 2, answer: [5, 7, 8], isCorrect: true }, { questionId: 3, answer: [12], isCorrect: true }, { questionId: 4, answer: 'Not sure yet.', isCorrect: false }, { questionId: 5, answer: [14], isCorrect: true }] },
  { id: 3, userId: 2, testId: 2, score: 2, maxScore: 3, percentage: 67, passed: false, completedAt: '2024-02-12T09:00:00Z', answers: [{ questionId: 6, answer: [19], isCorrect: true }, { questionId: 7, answer: [22, 23], isCorrect: false }, { questionId: 8, answer: [27], isCorrect: true }] },
  { id: 4, userId: 4, testId: 3, score: 2, maxScore: 2, percentage: 100, passed: true, completedAt: '2024-02-13T11:00:00Z', answers: [{ questionId: 9, answer: [31], isCorrect: true }, { questionId: 10, answer: [34, 36, 37], isCorrect: true }] },
]

export const db = {
  users: {
    findByEmail: (email) => users.find((user) => user.email === email),
    findById: (id) => users.find((user) => user.id === id),
    create: (data) => {
      const user = { id: Date.now(), ...data, createdAt: new Date().toISOString() }
      users.push(user)
      return user
    },
    update: (id, data) => {
      const index = users.findIndex((user) => user.id === id)
      if (index > -1) {
        users[index] = { ...users[index], ...data }
        return users[index]
      }
      return null
    },
    getAll: () => users,
  },
  tests: {
    getAll: () => tests.map((test) => localizeTest(test)),
    findById: (id) => {
      const test = tests.find((item) => item.id === id)
      return test ? localizeTest(test) : null
    },
    create: (data) => {
      const test = { id: Date.now(), ...data, createdAt: new Date().toISOString(), questions: [] }
      tests.push(test)
      return test
    },
    update: (id, data) => {
      const index = tests.findIndex((test) => test.id === id)
      if (index > -1) {
        tests[index] = { ...tests[index], ...data }
        return tests[index]
      }
      return null
    },
    delete: (id) => {
      tests = tests.filter((test) => test.id !== id)
    },
    addQuestion: (testId, question) => {
      const test = tests.find((item) => item.id === testId)
      if (!test) return null

      const nextQuestion = { id: Date.now(), testId, ...question }
      test.questions.push(nextQuestion)
      return nextQuestion
    },
    deleteQuestion: (testId, questionId) => {
      const test = tests.find((item) => item.id === testId)
      if (test) {
        test.questions = test.questions.filter((question) => question.id !== questionId)
      }
    },
  },
  results: {
    getAll: () => results,
    getByUser: (userId) => results.filter((result) => result.userId === userId),
    getByTest: (testId) => results.filter((result) => result.testId === testId),
    create: (data) => {
      const result = { id: Date.now(), ...data }
      results.push(result)
      return result
    },
  },
}
