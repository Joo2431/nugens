-- =============================================
--  NuGens Complete Database Schema
--  PostgreSQL
-- =============================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ──────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(30),
  avatar_url    TEXT,
  user_type     VARCHAR(20) NOT NULL CHECK (user_type IN ('individual','business')),
  career_field  VARCHAR(100),         -- for individuals
  career_stage  VARCHAR(100),         -- student, fresher, experienced, etc.
  career_goal   VARCHAR(200),         -- primary goal
  company_name  VARCHAR(200),         -- for business
  company_size  VARCHAR(50),          -- for business
  industry      VARCHAR(100),
  onboarding_done BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ──────────────────────────
CREATE TABLE subscriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id     VARCHAR(50) NOT NULL CHECK (product_id IN ('gen-e','hyperx','digihub','units','nugens')),
  plan_type      VARCHAR(20) NOT NULL CHECK (plan_type IN ('starter','premium','pro')),
  status         VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','paused','pending')),
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid','pending','failed','free')),
  start_date     TIMESTAMPTZ DEFAULT NOW(),
  end_date       TIMESTAMPTZ,
  stripe_sub_id  VARCHAR(200),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── INTERACTIONS ────────────────────────────
CREATE TABLE interactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id      VARCHAR(50) NOT NULL,
  interaction_type VARCHAR(100) NOT NULL,  -- 'resume_update','course_start','job_apply', etc.
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI CHAT HISTORY ─────────────────────────
CREATE TABLE ai_conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id   VARCHAR(50) NOT NULL,           -- which platform mini-AI
  role         VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant')),
  content      TEXT NOT NULL,
  tokens_used  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── GEN-E: RESUMES ──────────────────────────
CREATE TABLE resumes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  target_role     VARCHAR(200),
  content         JSONB NOT NULL,              -- structured resume JSON
  ats_score       INTEGER DEFAULT 0,
  version         INTEGER DEFAULT 1,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── GEN-E: JOBS ─────────────────────────────
CREATE TABLE job_applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id    UUID REFERENCES resumes(id),
  company      VARCHAR(200) NOT NULL,
  role         VARCHAR(200) NOT NULL,
  job_url      TEXT,
  status       VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied','screening','interview','offer','rejected','withdrawn')),
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── HYPERX: COURSES ─────────────────────────
CREATE TABLE courses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(300) NOT NULL,
  description  TEXT,
  category     VARCHAR(100),
  difficulty   VARCHAR(20) CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_hrs DECIMAL(5,2),
  thumbnail_url TEXT,
  video_count  INTEGER DEFAULT 0,
  has_cert     BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  price        DECIMAL(10,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        VARCHAR(300) NOT NULL,
  description  TEXT,
  video_url    TEXT,                           -- R2 or S3 URL
  duration_sec INTEGER,
  sort_order   INTEGER DEFAULT 0,
  is_free      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_pct INTEGER DEFAULT 0,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  cert_url     TEXT,
  enrolled_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id   UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  watched_sec INTEGER DEFAULT 0,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ── DIGIHUB: JOBS BOARD ─────────────────────
CREATE TABLE job_listings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by      UUID NOT NULL REFERENCES users(id),
  title          VARCHAR(300) NOT NULL,
  company        VARCHAR(200) NOT NULL,
  description    TEXT,
  requirements   JSONB DEFAULT '[]',
  salary_min     INTEGER,
  salary_max     INTEGER,
  currency       VARCHAR(10) DEFAULT 'USD',
  job_type       VARCHAR(50),                  -- full-time, contract, freelance
  location       VARCHAR(200),
  is_remote      BOOLEAN DEFAULT FALSE,
  is_active      BOOLEAN DEFAULT TRUE,
  tags           JSONB DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── DIGIHUB: COMMUNITY POSTS ────────────────
CREATE TABLE community_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  media_urls  JSONB DEFAULT '[]',
  likes       INTEGER DEFAULT 0,
  comments    INTEGER DEFAULT 0,
  is_visible  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── DIGIHUB: AI TOOL USAGE ──────────────────
CREATE TABLE ai_tool_usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_type   VARCHAR(100) NOT NULL,           -- 'poster','content_idea','post_plan'
  prompt      TEXT,
  output      JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── UNITS: BOOKINGS ─────────────────────────
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type    VARCHAR(100) NOT NULL,        -- photography, videography, editing, etc.
  scheduled_date  DATE NOT NULL,
  time_slot       VARCHAR(50),
  duration_hrs    DECIMAL(5,2),
  location        VARCHAR(300),
  notes           TEXT,
  status          VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  price           DECIMAL(10,2),
  payment_status  VARCHAR(20) DEFAULT 'pending',
  deliverables    JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id, status);
CREATE INDEX idx_interactions_user ON interactions(user_id, created_at DESC);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, product_id, created_at DESC);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_job_apps_user ON job_applications(user_id, created_at DESC);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_job_listings_active ON job_listings(is_active, created_at DESC);
CREATE INDEX idx_bookings_user ON bookings(user_id, scheduled_date);
CREATE INDEX idx_community_posts ON community_posts(is_visible, created_at DESC);

-- ── UPDATED_AT TRIGGER ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subs_updated       BEFORE UPDATE ON subscriptions   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_resumes_updated    BEFORE UPDATE ON resumes         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_job_apps_updated   BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated   BEFORE UPDATE ON bookings        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated      BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
