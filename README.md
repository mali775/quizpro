# QuizPro — Онлайн-тестирование

Полноценная платформа онлайн-тестирования с ролями Admin / Student.

## Стек технологий

| Слой | Технология |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| UI компоненты | Lucide-react (иконки), Recharts (графики) |
| i18n | i18next (RU / EN / KZ) |
| Backend | Node.js, Express |
| База данных | PostgreSQL |
| Аутентификация | JWT (jsonwebtoken) |

---

## Структура проекта

```
quizpro/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                  # Роутер
│       ├── main.jsx                 # Точка входа
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.jsx      # Глобальный auth state
│       ├── hooks/
│       │   └── index.js             # useTimer, useLocalStorage, useAutoSave, useAsync
│       ├── services/
│       │   ├── mockDb.js            # Mock БД (замените на реальный API)
│       │   ├── authService.js
│       │   ├── testService.js
│       │   ├── resultService.js
│       │   └── userService.js
│       ├── utils/
│       │   └── helpers.js           # shuffle, formatTime, calcScore, exportCSV
│       ├── i18n/
│       │   ├── i18n.js
│       │   └── locales/
│       │       ├── ru.json
│       │       ├── en.json
│       │       └── kz.json
│       ├── components/
│       │   ├── ui/
│       │   │   └── index.jsx        # Button, Input, Card, Modal, Badge, ...
│       │   └── layout/
│       │       ├── AppLayout.jsx    # Главный лейаут с Sidebar
│       │       ├── Sidebar.jsx      # Навигация (Admin / Student)
│       │       ├── RouteGuards.jsx  # PrivateRoute, AdminRoute, StudentRoute
│       │       └── LangSwitcher.jsx
│       └── pages/
│           ├── AuthPages.jsx        # Login + Register
│           ├── PendingPage.jsx      # Ожидание одобрения
│           ├── admin/
│           │   ├── Dashboard.jsx    # Статистика + графики
│           │   ├── Tests.jsx        # CRUD тестов + вопросов
│           │   ├── Users.jsx        # Одобрение студентов
│           │   ├── Results.jsx      # Все результаты
│           │   └── Analytics.jsx    # Детальная аналитика
│           └── student/
│               ├── Home.jsx         # Список тестов
│               ├── TestPage.jsx     # Прохождение теста (таймер, античит)
│               ├── ResultPage.jsx   # Результаты теста
│               ├── Results.jsx      # История результатов
│               └── Profile.jsx      # Профиль
│
├── backend/
│   ├── config/
│   │   ├── database.js              # PostgreSQL Pool
│   │   └── schema.sql               # Схема БД + seed
│   ├── src/
│   │   ├── server.js                # Express точка входа
│   │   ├── routes/
│   │   │   └── index.js             # Все маршруты API
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── testController.js
│   │   │   └── resultController.js
│   │   └── middleware/
│   │       ├── auth.js              # JWT verify, requireAdmin, requireApproved
│   │       └── errorHandler.js      # Валидация, 404, global error
│   └── .env.example
│
└── package.json                     # Корневой (запуск обоих серверов)
```

---

## Быстрый старт

### 1. Установка зависимостей

```bash
# Корневой уровень
npm install

# Все зависимости (frontend + backend)
npm run install:all
```

### 2. Настройка PostgreSQL

```bash
# Создать базу данных
createdb quizpro

# Выполнить схему
psql -U postgres -d quizpro -f backend/config/schema.sql
```

### 3. Переменные окружения (backend)

```bash
cp backend/.env.example backend/.env
# Отредактируйте backend/.env — укажите DB_PASSWORD и JWT_SECRET
```

### 4. Запуск

```bash
# Запустить frontend (порт 3000) + backend (порт 5001) одновременно
npm run dev

# Или по отдельности:
npm run dev:frontend
npm run dev:backend
```

---

## API Endpoints

| Метод | URL | Доступ | Описание |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Регистрация |
| POST | `/api/auth/login` | Public | Вход |
| GET | `/api/auth/me` | Auth | Текущий пользователь |
| GET | `/api/users` | Admin | Список студентов |
| PATCH | `/api/users/:id/approve` | Admin | Одобрить студента |
| PATCH | `/api/users/:id/reject` | Admin | Отклонить студента |
| GET | `/api/tests` | Auth+Approved | Все тесты |
| GET | `/api/tests/:id` | Auth+Approved | Тест по ID |
| POST | `/api/tests` | Admin | Создать тест |
| PUT | `/api/tests/:id` | Admin | Обновить тест |
| DELETE | `/api/tests/:id` | Admin | Удалить тест |
| POST | `/api/tests/:id/questions` | Admin | Добавить вопрос |
| DELETE | `/api/tests/:id/questions/:qid` | Admin | Удалить вопрос |
| GET | `/api/results` | Auth | Результаты (все/свои) |
| GET | `/api/results/:id` | Auth | Результат по ID |
| POST | `/api/results` | Student+Approved | Сдать тест |

---

## Демо-аккаунты (mock режим)

| Роль | Email | Пароль |
|---|---|---|
| Администратор | admin@quiz.com | admin123 |
| Студент (одобрен) | aliya@student.com | pass123 |
| Студент (ожидает) | maxim@student.com | pass123 |

---

## Ключевые возможности

- **JWT аутентификация** с ролями `admin` / `student`
- **Система одобрения**: студент не имеет доступа к тестам пока admin не одобрит
- **Прохождение теста**: таймер с авто-завершением, перемешка вопросов, античит (запрет возврата назад)
- **Автосохранение** ответов в localStorage каждые 1.5 сек
- **Три типа вопросов**: один ответ, несколько ответов, открытый вопрос
- **Аналитика**: графики Recharts, часто ошибочные вопросы
- **Экспорт** результатов в CSV
- **Мультиязычность**: русский, английский, казахский (i18next)
- **Защита роутов**: `AdminRoute`, `StudentRoute`, `PublicRoute`

---

## Переход на реальный backend

Файлы `src/services/*.js` сейчас используют `mockDb.js`.
Для подключения реального API замените вызовы в сервисах на `axios`:

```js
// Было (mock):
import { db } from './mockDb'
const getAll = async () => db.tests.getAll()

// Стало (real API):
import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
const getAll = async () => (await api.get('/tests')).data
```
