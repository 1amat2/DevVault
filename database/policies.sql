-- ============================================================
--  DevVault — Row Level Security Policies
--  Run this AFTER schema.sql in Supabase SQL Editor.
-- ============================================================

-- ─── Enable RLS on every table ───────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log    ENABLE ROW LEVEL SECURITY;

-- ─── profiles ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── projects ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own projects" ON projects;
CREATE POLICY "Users manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Public projects are readable by everyone (including anon)
DROP POLICY IF EXISTS "Public projects readable by all" ON projects;
CREATE POLICY "Public projects readable by all"
  ON projects FOR SELECT
  USING (is_public = true);

-- ─── tasks ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own tasks" ON tasks;
CREATE POLICY "Users manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── notes ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own notes" ON notes;
CREATE POLICY "Users manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── documents ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own documents" ON documents;
CREATE POLICY "Users manage own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── learning_items ──────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own learning items" ON learning_items;
CREATE POLICY "Users manage own learning items"
  ON learning_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── github_accounts ─────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own github accounts" ON github_accounts;
CREATE POLICY "Users manage own github accounts"
  ON github_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── activity_log ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users read own activity" ON activity_log;
CREATE POLICY "Users read own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own activity" ON activity_log;
CREATE POLICY "Users create own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Storage bucket policies (run after creating buckets) ────
-- Bucket: avatars (public)
-- INSERT: only the owner can upload to their own path
-- SELECT: public read
--
-- In Supabase Storage dashboard:
--   1. Create bucket "avatars" → set to Public
--   2. Create bucket "covers"  → set to Public
--
-- Then add these policies via the Supabase Storage Policy UI:
--
--   avatars: INSERT  → auth.uid()::text = (storage.foldername(name))[1]
--   avatars: UPDATE  → auth.uid()::text = (storage.foldername(name))[1]
--   avatars: DELETE  → auth.uid()::text = (storage.foldername(name))[1]
--   avatars: SELECT  → true (public)
--   covers:  (same as above)
