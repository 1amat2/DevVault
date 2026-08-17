-- ============================================================
--  DevVault — Seed Data
--  Run this AFTER schema.sql and policies.sql.
--  Creates a demo profile and sample data for development.
--
--  Steps:
--  1. Sign up in the app (or create a user in Supabase Auth → Users)
--  2. Copy the user's UUID from Supabase Auth → Users → the UUID column
--  3. Replace the value below with that UUID (keep the single quotes)
--  4. Run this script in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  uid UUID := 'YOUR_USER_UUID_HERE';  -- <- Replace with your actual user UUID from Supabase Auth
BEGIN

-- ─── Profile ─────────────────────────────────────────────────
INSERT INTO profiles (id, display_name, username, bio, location, github_username, streak)
VALUES (
  uid,
  'Dev User',
  'devuser',
  'Developer building things and documenting the journey.',
  '',
  '',
  0
)
ON CONFLICT (id) DO UPDATE SET
  display_name    = EXCLUDED.display_name,
  username        = EXCLUDED.username,
  bio             = EXCLUDED.bio,
  location        = EXCLUDED.location,
  github_username = EXCLUDED.github_username,
  streak          = EXCLUDED.streak;

-- ─── Projects ────────────────────────────────────────────────
INSERT INTO projects (id, owner_id, name, slug, description, status, category, progress, tech, icon, color, repository_url, live_url, is_public, created_at, updated_at)
VALUES
  (gen_random_uuid(), uid, 'HomeHive',  'homehive',  'Property marketplace connecting tenants and landlords.',  'active',    'Web',     65, ARRAY['Next.js','Supabase','Tailwind CSS'], '🏠', '#22C55E', '', '', true,  NOW() - INTERVAL '42 days', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), uid, 'DevVault',  'devvault',  'Developer dashboard to manage projects and life.',        'active',    'Web',     80, ARRAY['HTML','CSS','JavaScript','Node.js'], '⚡', '#7C5CFF', '', '', true,  NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), uid, 'MinePanel', 'minepanel', 'Minecraft server manager and dashboard.',                 'hold',      'Web',     50, ARRAY['Node.js','Express','MongoDB'],       '🎮', '#F59E0B', '', '', false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), uid, 'TradeLab',  'tradelab',  'Trading analysis and backtesting platform.',              'active',    'Backend', 40, ARRAY['Python','Pandas','PostgreSQL'],      '📈', '#3B82F6', '', '', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), uid, 'ClipForge', 'clipforge', 'AI tool to turn long videos into short clips.',           'completed', 'AI',      100,ARRAY['Python','FastAPI','FFmpeg'],         '✂️', '#EF4444', '', '', true,  NOW() - INTERVAL '90 days', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- ─── Tasks (use a project that was just inserted) ─────────────
-- We reference projects by slug for readability
WITH p AS (SELECT id, slug FROM projects WHERE owner_id = uid)
INSERT INTO tasks (owner_id, project_id, user_id, title, description, status, priority, due_date, position, created_at, updated_at)
SELECT
  uid,
  p.id,
  uid,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.due_date::DATE,
  t.pos,
  t.created_at,
  t.updated_at
FROM (
  VALUES
    ('homehive', 'Finish authentication flow',  'Supabase Auth with email verification.', 'in-progress', 'critical', (NOW() + INTERVAL '3 days')::TEXT, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour'),
    ('homehive', 'Design landing page',         'Hero section with property search.',     'todo',        'high',     (NOW() + INTERVAL '7 days')::TEXT, 2, NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
    ('homehive', 'Property listing page',       'Grid/list view with filters.',           'in-progress', 'medium',   (NOW() + INTERVAL '14 days')::TEXT,3, NOW() - INTERVAL '12 days',NOW() - INTERVAL '4 hours'),
    ('homehive', 'User dashboard',              'Tenant and landlord stats.',             'review',      'medium',   (NOW() + INTERVAL '5 days')::TEXT, 4, NOW() - INTERVAL '15 days',NOW() - INTERVAL '1 day'),
    ('homehive', 'Project setup',               'Init repo, deps, linting.',              'done',        'low',      (NOW() - INTERVAL '40 days')::TEXT,5, NOW() - INTERVAL '42 days',NOW() - INTERVAL '40 days'),
    ('devvault', 'Build sidebar component',     'Reusable sidebar with active states.',   'done',        'high',     (NOW() - INTERVAL '25 days')::TEXT,1, NOW() - INTERVAL '30 days',NOW() - INTERVAL '25 days'),
    ('devvault', 'Build data layer',            'localStorage-backed store.',             'done',        'high',     (NOW() - INTERVAL '15 days')::TEXT,2, NOW() - INTERVAL '20 days',NOW() - INTERVAL '10 days'),
    ('devvault', 'Build dashboard page',        'Stats, charts, activity feed.',          'in-progress', 'high',     (NOW() + INTERVAL '2 days')::TEXT, 3, NOW() - INTERVAL '10 days',NOW() - INTERVAL '2 hours'),
    ('tradelab', 'Backtesting engine',          'Core algorithm for strategy testing.',   'in-progress', 'critical', (NOW() + INTERVAL '5 days')::TEXT, 1, NOW() - INTERVAL '15 days',NOW() - INTERVAL '1 day'),
    ('tradelab', 'Chart visualization',         'Candlestick charts with indicators.',    'todo',        'high',     (NOW() + INTERVAL '10 days')::TEXT,2, NOW() - INTERVAL '12 days',NOW() - INTERVAL '5 days')
) AS t(slug, title, description, status, priority, due_date, pos, created_at, updated_at)
JOIN p ON p.slug = t.slug
ON CONFLICT DO NOTHING;

-- ─── Notes ───────────────────────────────────────────────────
INSERT INTO notes (user_id, title, content, category, is_pinned, created_at, updated_at)
VALUES
  (uid, 'JavaScript Async/Await',
   E'## JavaScript Async/Await\n\nAsync/await is syntactic sugar over Promises.\n\n```javascript\nasync function getUser() {\n  const res = await fetch(''/api/auth/me'');\n  return await res.json();\n}\n```\n\n- `async` functions always return a Promise\n- `await` pauses until the Promise resolves\n- Use try/catch for error handling',
   'JavaScript', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 day'),

  (uid, 'Supabase Row Level Security',
   E'## Supabase Row Level Security\n\nRLS controls which rows a user can access.\n\n```sql\nCREATE POLICY "Users can view own profile"\nON profiles FOR SELECT\nUSING (auth.uid() = id);\n```\n\n## Enable RLS\n\n```sql\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\n```',
   'Supabase', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 hours'),

  (uid, 'Useful Git Commands',
   E'## Useful Git Commands\n\n```bash\n# Branches\ngit checkout -b feature/new\ngit merge feature/new\n\n# Stash\ngit stash && git stash pop\n\n# Undo\ngit reset --soft HEAD~1\ngit restore .\n```',
   'Git', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),

  (uid, 'PostgreSQL Cheatsheet',
   E'## PostgreSQL Cheatsheet\n\n```sql\n-- Create table\nCREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());\n\n-- Query\nSELECT * FROM users WHERE email = ''user@devvault.app'';\n\n-- Insert\nINSERT INTO users (email) VALUES (''newuser@devvault.app'');\n\n-- Update\nUPDATE users SET email = ''updated@devvault.app'' WHERE id = ''...'';\n```',
   'Supabase', false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- ─── Learning items ───────────────────────────────────────────
INSERT INTO learning_items (user_id, technology, description, progress, status, icon, color, start_date, target_date)
VALUES
  (uid, 'TypeScript',      'Type-safe JavaScript — migrating projects.',  60, 'in-progress', '🔷', '#3B82F6', (NOW() - INTERVAL '30 days')::DATE, (NOW() + INTERVAL '60 days')::DATE),
  (uid, 'Docker',          'Containerise all the things.',                 40, 'in-progress', '🐳', '#2496ED', (NOW() - INTERVAL '20 days')::DATE, (NOW() + INTERVAL '90 days')::DATE),
  (uid, 'PostgreSQL',      'Advanced queries and optimisation.',           75, 'in-progress', '🐘', '#336791', (NOW() - INTERVAL '60 days')::DATE, (NOW() + INTERVAL '30 days')::DATE),
  (uid, 'Redis',           'Caching and session storage.',                 20, 'not-started', '🔴', '#EF4444', NULL,                               (NOW() + INTERVAL '120 days')::DATE),
  (uid, 'Rust',            'Systems programming deep dive.',               10, 'not-started', '🦀', '#F59E0B', NULL,                               NULL),
  (uid, 'Git & GitHub',    'Advanced Git workflows and Actions.',          90, 'in-progress', '🐙', '#333333', (NOW() - INTERVAL '90 days')::DATE, (NOW() + INTERVAL '10 days')::DATE)
ON CONFLICT DO NOTHING;

-- ─── Activity log ─────────────────────────────────────────────
INSERT INTO activity_log (user_id, type, text, created_at)
VALUES
  (uid, 'project', 'Created project "HomeHive"',       NOW() - INTERVAL '42 days'),
  (uid, 'project', 'Created project "DevVault"',       NOW() - INTERVAL '30 days'),
  (uid, 'task',    'Completed "Project setup"',        NOW() - INTERVAL '40 days'),
  (uid, 'task',    'Completed "Build sidebar"',        NOW() - INTERVAL '25 days'),
  (uid, 'note',    'Created note "Async/Await"',       NOW() - INTERVAL '45 days'),
  (uid, 'task',    'Moved "User dashboard" to Review', NOW() - INTERVAL '1 day'),
  (uid, 'note',    'Updated Supabase RLS note',        NOW() - INTERVAL '2 hours'),
  (uid, 'project', 'Updated DevVault progress to 80%', NOW() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

END $$;
