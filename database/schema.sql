-- ============================================================
--  DevVault — Database Schema
--  Run this in Supabase SQL Editor first.
--  Tables: profiles, projects, tasks, notes, documents,
--          learning_items, github_accounts, activity_log
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
-- Extends Supabase auth.users. Automatically created on signup
-- via the trigger below.
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT UNIQUE,
  display_name     TEXT,
  bio              TEXT,
  avatar_url       TEXT,
  location         TEXT,
  website_url      TEXT,
  github_url       TEXT,
  github_username  TEXT,
  streak           INTEGER  DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── projects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT,
  description       TEXT,
  status            TEXT DEFAULT 'planning'
    CHECK (status IN ('idea','planning','active','hold','completed','archived')),
  category          TEXT DEFAULT 'Web',
  progress          INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  tech              TEXT[]   DEFAULT '{}',
  icon              TEXT,
  color             TEXT,
  repository_url    TEXT,
  live_url          TEXT,
  documentation_url TEXT,
  cover_image       TEXT,
  is_public         BOOLEAN DEFAULT false,
  start_date        DATE,
  target_date       DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner   ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status  ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_public  ON projects(is_public) WHERE is_public = true;

-- ─── tasks ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo'
    CHECK (status IN ('backlog','todo','in-progress','review','done')),
  priority    TEXT DEFAULT 'medium'
    CHECK (priority IN ('critical','high','medium','low')),
  due_date    DATE,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user       ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project    ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);

-- ─── notes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  content    TEXT DEFAULT '',
  category   TEXT DEFAULT 'General',
  is_pinned  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user     ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(user_id, category);

-- ─── documents ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT DEFAULT '',
  document_type TEXT DEFAULT 'README'
    CHECK (document_type IN ('README','Architecture','API','Deployment','Changelog','Custom')),
  version       TEXT DEFAULT '1.0',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_docs_user    ON documents(user_id);

-- ─── learning_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technology     TEXT NOT NULL,
  description    TEXT,
  progress       INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status         TEXT DEFAULT 'in-progress'
    CHECK (status IN ('not-started','in-progress','completed','paused')),
  icon           TEXT,
  color          TEXT,
  start_date     DATE,
  target_date    DATE,
  completed_date DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_user ON learning_items(user_id);

-- ─── github_accounts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  github_user_id   TEXT UNIQUE,
  username         TEXT,
  -- NOTE: encrypt access_token before storing in production
  access_token     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_user ON github_accounts(user_id);

-- ─── activity_log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT,   -- 'project' | 'task' | 'note' | 'commit' | 'ai' | ...
  text       TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
