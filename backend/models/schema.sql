-- ═══════════════════════════════════════════════════════
-- NuGens Complete PostgreSQL Schema — Supabase Fixed
-- ═══════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),
  full_name       VARCHAR(255),
  avatar_url      VARCHAR(500),
  provider        VARCHAR(50) DEFAULT 'email',
  provider_id     VARCHAR(255),
  google_id       VARCHAR(255) UNIQUE,
  google_email    VARCHAR(255),
  google_picture  VARCHAR(500),
  role            VARCHAR(20) DEFAULT 'individual',
  is_verified     BOOLEAN DEFAULT false,
  verify_token    VARCHAR(255),
  reset_token     VARCHAR(255),
  reset_expires   TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   VARCHAR(45),
  login_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER PROFILES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  career_stage      VARCHAR(50),
  "current_role"    VARCHAR(255),
  years_experience  INTEGER DEFAULT 0,
  field_of_interest VARCHAR(255),
  target_role       VARCHAR(255),
  skills            TEXT[],
  location          VARCHAR(255),
  salary_min        INTEGER,
  salary_max        INTEGER,
  career_goals      TEXT,
  linkedin_url      VARCHAR(500),
  portfolio_url     VARCHAR(500),
  bio               TEXT,
  profile_complete  INTEGER DEFAULT 0,
  onboarded         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  plan                 VARCHAR(20) DEFAULT 'free',
  status               VARCHAR(20) DEFAULT 'active',
  razorpay_sub_id      VARCHAR(255),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI USAGE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year      VARCHAR(7),
  chat_count      INTEGER DEFAULT 0,
  analysis_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- ─── RESUMES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(255) DEFAULT 'My Resume',
  raw_text       TEXT,
  structured     JSONB,
  ats_score      INTEGER,
  overall_score  INTEGER,
  analysis       JSONB,
  target_role    VARCHAR(255),
  is_active      BOOLEAN DEFAULT true,
  is_primary     BOOLEAN DEFAULT false,
  content        JSONB,
  version        INTEGER DEFAULT 1,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SAVED JOBS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  job_title    VARCHAR(255),
  company      VARCHAR(255),
  location     VARCHAR(255),
  job_type     VARCHAR(50),
  salary       VARCHAR(100),
  match_score  INTEGER,
  tags         TEXT[],
  job_url      VARCHAR(500),
  source       VARCHAR(100),
  status       VARCHAR(50) DEFAULT 'saved',
  notes        TEXT,
  applied_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOB APPLICATIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  company     VARCHAR(255),
  role        VARCHAR(255),
  job_url     VARCHAR(500),
  resume_id   UUID REFERENCES resumes(id) ON DELETE SET NULL,
  status      VARCHAR(50) DEFAULT 'applied',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOB LISTINGS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_listings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255),
  company     VARCHAR(255),
  location    VARCHAR(255),
  description TEXT,
  salary      VARCHAR(100),
  job_type    VARCHAR(50),
  tags        TEXT[],
  job_url     VARCHAR(500),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SKILL GAPS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_gaps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role   VARCHAR(255),
  skills_data   JSONB,
  overall_score INTEGER,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAREER ROADMAPS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255),
  goal        TEXT,
  weeks       JSONB,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT SESSIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) DEFAULT 'New conversation',
  messages    JSONB DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LOGIN HISTORY ────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(20) DEFAULT 'email',
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  status      VARCHAR(20) DEFAULT 'success',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id      ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user        ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user         ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user      ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_user        ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user   ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_update ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_user   ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user        ON ai_usage(user_id, month_year);

-- ─── TRIGGER: auto-create profile + subscription ─────
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan) VALUES (NEW.id, 'free')
    ON CONFLICT DO NOTHING;
  INSERT INTO user_profiles (user_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- ─── TRIGGER: chat session updated_at ────────────────
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chat_session_updated ON chat_sessions;
CREATE TRIGGER chat_session_updated
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_chat_timestamp();