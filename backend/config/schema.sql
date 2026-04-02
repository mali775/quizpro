-- ============================================================
--  QuizPro – Database Schema
--  Run:  psql -U postgres -d quizpro -f schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20)  NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_approved  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Tests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tests (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  time_limit        INTEGER      NOT NULL DEFAULT 30,   -- minutes
  attempts          INTEGER      NOT NULL DEFAULT 3,
  min_pass_score    INTEGER      NOT NULL DEFAULT 60,   -- percent
  shuffle_questions BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by        INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Questions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id          SERIAL PRIMARY KEY,
  test_id     INTEGER      NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  type        VARCHAR(20)  NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple', 'open')),
  text        TEXT         NOT NULL,
  position    INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Answers (options) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
  id           SERIAL PRIMARY KEY,
  question_id  INTEGER   NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text         TEXT      NOT NULL,
  is_correct   BOOLEAN   NOT NULL DEFAULT FALSE,
  position     INTEGER   NOT NULL DEFAULT 0
);

-- ── Results ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id      INTEGER   NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score        INTEGER   NOT NULL DEFAULT 0,
  max_score    INTEGER   NOT NULL DEFAULT 0,
  percentage   INTEGER   NOT NULL DEFAULT 0,
  passed       BOOLEAN   NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Result answers (per-question response) ───────────────────
CREATE TABLE IF NOT EXISTS result_answers (
  id          SERIAL PRIMARY KEY,
  result_id   INTEGER  NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  question_id INTEGER  NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer      TEXT,               -- JSON array for multi/single, plain text for open
  is_correct  BOOLEAN  NOT NULL DEFAULT FALSE
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_test_id  ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id     ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_test_id     ON results(test_id);
CREATE INDEX IF NOT EXISTS idx_result_answers_rid  ON result_answers(result_id);

-- ── Seed admin user (password: admin123) ─────────────────────
INSERT INTO users (first_name, last_name, email, password, role, is_approved)
VALUES ('Admin', 'User', 'admin@quiz.com',
        '$2a$10$DVmSQb.x3LjhU9lPBW2gKO7EsEAqCa2Vismbvrwkg3X.5iUuGPJnK',
        'admin', TRUE)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved,
    updated_at = NOW();

-- ── Seed demo student (password: pass123) ─────────────────────
INSERT INTO users (first_name, last_name, email, password, role, is_approved)
VALUES ('Malika', 'Student', 'malika@gmail.com',
        '$2a$10$WsszHc1THZ/LQP6y89Q8MeKvu5/dDcsnxbZPwthk3LwUjfkYod0JO',
        'student', TRUE)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_approved = EXCLUDED.is_approved,
    updated_at = NOW();
