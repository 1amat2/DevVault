# DevVault

> **Your code. Your projects. Your progress. One vault.**

DevVault is a personal developer command center — a full-stack productivity platform that combines project management, task tracking, notes, documentation, GitHub integration, developer analytics, a learning tracker, a public portfolio, and an AI assistant into one application.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Supabase Setup](#5-supabase-setup)
6. [Database Schema](#6-database-schema)
7. [Row Level Security](#7-row-level-security)
8. [Node.js Backend](#8-nodejs-backend)
9. [Authentication](#9-authentication)
10. [Frontend Pages](#10-frontend-pages)
11. [Data Layer](#11-data-layer)
12. [GitHub Integration](#12-github-integration)
13. [AI Assistant](#13-ai-assistant)
14. [Environment Variables](#14-environment-variables)
15. [Deployment](#15-deployment)
16. [Roadmap](#16-roadmap)

---

## 1. Overview

DevVault is built as a **faceless YouTube coding channel** flagship project. It demonstrates full-stack development without React — using only HTML, CSS, Vanilla JavaScript, Node.js, Express, and Supabase.

### Core concept

```
GitHub + Notion + Trello + Developer Portfolio + AI assistant — without the complexity of multiple tools.
```

### What you can do with DevVault

- Manage coding projects (IDEA → PLANNING → ACTIVE → COMPLETED → ARCHIVED)
- Track tasks with a Kanban board (Backlog → Todo → In Progress → Review → Done)
- Write technical notes in Markdown with syntax highlighting
- Store per-project documentation (README, Architecture, API docs, Deployment guides, etc.)
- Connect GitHub to sync repositories and contribution data
- Track developer analytics (commits, coding time, task velocity)
- Track your learning progress across technologies
- Generate a public developer portfolio automatically
- Use an AI assistant that understands your projects and tasks

---

## 2. Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure |
| CSS3 + Custom Properties | Styling and theming |
| Vanilla JavaScript (ES Modules) | Interactivity and data binding |

> **No React. No Next.js. No JSX.** This is an explicit constraint of the project.

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime |
| Express.js | HTTP server and API routes |
| Supabase JS Client | Database and auth on the server |

### Database / Services

| Service | Purpose |
|---------|---------|
| Supabase PostgreSQL | Primary database |
| Supabase Auth | Email/password authentication |
| Supabase Storage | File and image uploads |
| Supabase Realtime | Live updates (future) |

### Deployment

| Platform | Purpose |
|----------|---------|
| Vercel | Frontend and Node.js backend |
| Supabase | Database, auth, storage |

---

## 3. Project Structure

```
devvault/
│
├── src/
│   ├── pages/
│   │   ├── index.html          ← Dashboard
│   │   ├── login.html          ← Authentication
│   │   ├── projects.html       ← Project list
│   │   ├── project.html        ← Project detail (tabs)
│   │   ├── tasks.html          ← Kanban task board
│   │   ├── notes.html          ← Markdown notes editor
│   │   ├── doc.html            ← Documentation viewer
│   │   ├── github.html         ← GitHub overview
│   │   ├── learning.html       ← Learning tracker
│   │   ├── analytics.html      ← Developer analytics
│   │   ├── ai.html             ← AI assistant chat
│   │   ├── portfolio.html      ← Public portfolio
│   │   └── settings.html       ← User settings
│   │
│   ├── components/
│   │   ├── sidebar.js          ← Sidebar active-state patcher
│   │   └── sidebar.html        ← Static sidebar HTML partial
│   │
│   ├── css/
│   │   ├── variables.css       ← Design tokens
│   │   ├── base.css            ← Reset and typography
│   │   ├── layout.css          ← App shell and sidebar
│   │   ├── components.css      ← Reusable UI components
│   │   ├── animations.css      ← Keyframes and motion
│   │   └── responsive.css      ← Mobile breakpoints
│   │
│   └── js/
│       ├── data.js             ← localStorage data store
│       ├── app.js              ← Shared utilities
│       └── features/           ← Page-specific feature modules
│
├── server/
│   ├── server.js               ← Express entry point
│   ├── middleware/
│   │   ├── auth.js             ← JWT verification middleware
│   │   └── errorHandler.js     ← Global error handler
│   └── routes/
│       ├── auth.js             ← /api/auth/* routes
│       ├── projects.js         ← /api/projects/* routes
│       ├── tasks.js            ← /api/tasks/* routes
│       ├── notes.js            ← /api/notes/* routes
│       ├── github.js           ← /api/github/* routes
│       └── ai.js               ← /api/ai/* routes
│
├── database/
│   ├── schema.sql              ← All table definitions
│   ├── policies.sql            ← Row Level Security policies
│   └── seed.sql                ← Sample data for development
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.example                ← Template for environment variables
├── package.json
├── vercel.json                 ← Vercel deployment config
└── README.md
```

---

## 4. Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [npm](https://npmjs.com) or [pnpm](https://pnpm.io)
- A [Supabase](https://supabase.com) account (free tier is enough)
- A code editor (VS Code recommended)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/devvault.git
cd devvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#14-environment-variables) for all required values.

### 4. Set up Supabase

Follow the [Supabase Setup](#5-supabase-setup) section below, then run the schema SQL.

### 5. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`.

### 6. Open in your browser

Open `src/pages/login.html` (or `http://localhost:3001`) to start.

> **Current state:** The frontend works fully with `localStorage` as the data layer. You can open any HTML file in `src/pages/` directly in your browser — no server required for the frontend. The Node.js server adds Supabase persistence and GitHub OAuth.

---

## 5. Supabase Setup

### Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API
3. Note your **Service Role Key** (keep this secret — server-side only)

### Run the database schema

1. In the Supabase dashboard, click **SQL Editor**
2. Paste the contents of `database/schema.sql` and click **Run**
3. Paste the contents of `database/policies.sql` and click **Run**
4. Optionally run `database/seed.sql` to populate sample data

### Enable authentication

1. In Supabase → Authentication → Providers
2. Enable **Email** provider
3. Configure **Site URL** to your domain (or `http://localhost:3001` for development)
4. Set **Redirect URLs** to include `http://localhost:3001/src/pages/index.html`

### Enable Storage (for avatars and project covers)

1. In Supabase → Storage
2. Create a bucket called `avatars` (public)
3. Create a bucket called `covers` (public)

---

## 6. Database Schema

Run this in your Supabase SQL editor to create all tables:

```sql
-- profiles (extends Supabase Auth users)
CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT UNIQUE,
  display_name   TEXT,
  bio            TEXT,
  avatar_url     TEXT,
  location       TEXT,
  website_url    TEXT,
  github_url     TEXT,
  github_username TEXT,
  streak         INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- projects
CREATE TABLE projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT,
  description      TEXT,
  status           TEXT DEFAULT 'planning' CHECK (status IN ('idea','planning','active','hold','completed','archived')),
  category         TEXT DEFAULT 'Web',
  progress         INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  tech             TEXT[],
  icon             TEXT,
  color            TEXT,
  repository_url   TEXT,
  live_url         TEXT,
  documentation_url TEXT,
  cover_image      TEXT,
  is_public        BOOLEAN DEFAULT false,
  start_date       DATE,
  target_date      DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- tasks
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo' CHECK (status IN ('backlog','todo','in-progress','review','done')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  due_date    DATE,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- notes
CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  content    TEXT,
  category   TEXT DEFAULT 'General',
  is_pinned  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- documents
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT,
  document_type TEXT DEFAULT 'README',
  version       TEXT DEFAULT '1.0',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- learning_items
CREATE TABLE learning_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technology     TEXT NOT NULL,
  description    TEXT,
  progress       INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status         TEXT DEFAULT 'in-progress',
  icon           TEXT,
  color          TEXT,
  start_date     DATE,
  target_date    DATE,
  completed_date DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- github_accounts
CREATE TABLE github_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  github_user_id   TEXT UNIQUE,
  username         TEXT,
  access_token     TEXT, -- encrypted server-side
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- activity_log
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT,
  text         TEXT,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Row Level Security

Enable RLS on every table and create policies so users can only access their own data.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log   ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users manage own projects"
  ON projects FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public projects are readable by all"
  ON projects FOR SELECT USING (is_public = true);

-- Tasks
CREATE POLICY "Users manage own tasks"
  ON tasks FOR ALL USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users manage own notes"
  ON notes FOR ALL USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users manage own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);

-- Learning items
CREATE POLICY "Users manage own learning items"
  ON learning_items FOR ALL USING (auth.uid() = user_id);

-- Activity log
CREATE POLICY "Users read own activity"
  ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own activity"
  ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 8. Node.js Backend

### Install dependencies

```bash
npm install express @supabase/supabase-js dotenv cors helmet express-rate-limit
npm install --save-dev nodemon
```

### server/server.js

```javascript
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static('src'));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/notes',    require('./routes/notes'));
app.use('/api/github',   require('./routes/github'));
app.use('/api/ai',       require('./routes/ai'));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`DevVault running on port ${PORT}`));
```

### server/services/supabase.js

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // server-side only — never expose this
);

module.exports = supabase;
```

### Example route: server/routes/projects.js

```javascript
const express   = require('express');
const router    = express.Router();
const supabase  = require('../services/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const { name, description, status, tech, category } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { data, error } = await supabase
      .from('projects')
      .insert({ owner_id: req.user.id, name, description, status, tech, category })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
```

### server/middleware/auth.js

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
};
```

---

## 9. Authentication

DevVault uses Supabase Auth for email/password authentication.

### Frontend auth flow

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Sign Up
async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } }
  });
  if (error) throw error;
  return data;
}

// Sign In
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // Store session
  localStorage.setItem('dv_session', JSON.stringify(data.session));
  return data;
}

// Sign Out
async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('dv_session');
  window.location.href = 'login.html';
}

// Get current user
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### Session management

DevVault checks for a valid session on every page load:

```javascript
// In app.js or at top of every page
const session = JSON.parse(localStorage.getItem('dv_session') || 'null');
if (!session && !location.pathname.includes('login')) {
  window.location.href = 'login.html';
}
```

---

## 10. Frontend Pages

| Page | File | Description |
|------|------|-------------|
| Login | `login.html` | Sign in, sign up, password reset |
| Dashboard | `index.html` | Overview stats, activity, projects |
| Projects | `projects.html` | All projects with filters |
| Project Detail | `project.html` | Tabs: overview, tasks, notes, docs, activity |
| Tasks | `tasks.html` | Kanban board with drag-and-drop |
| Notes | `notes.html` | 3-pane markdown notes editor |
| Documentation | `doc.html` | Per-project markdown documentation |
| GitHub | `github.html` | Repos, contribution heatmap |
| Learning | `learning.html` | Technology progress tracker |
| Analytics | `analytics.html` | Charts: commits, tasks, languages |
| AI Assistant | `ai.html` | Context-aware chat interface |
| Portfolio | `portfolio.html` | Public developer portfolio |
| Settings | `settings.html` | Profile, preferences, integrations |

### Sidebar

The sidebar is embedded as **static HTML** in every page so it renders instantly with no JavaScript-dependent flash. The `sidebar.js` module only patches the active state and updates live data (pending task count, profile name) after load.

---

## 11. Data Layer

### Current (localStorage)

The frontend uses a `localStorage`-backed data store in `src/js/data.js`. This works fully in the browser with no server.

```javascript
import { Projects, Tasks, Notes, Profile, Stats } from '../js/data.js';

// Read
const projects = Projects.all();
const activeProjects = Projects.active();

// Create
const project = Projects.create({ name: 'HomeHive', status: 'active' });

// Update
Projects.update('p1', { progress: 75 });

// Delete
Projects.delete('p1');
```

### Migrating to Supabase

Replace `localStorage` calls with API calls once the backend is running:

```javascript
// Before (localStorage)
const projects = Projects.all();

// After (API)
const res      = await fetch('/api/projects', {
  headers: { Authorization: `Bearer ${getToken()}` }
});
const projects = await res.json();
```

---

## 12. GitHub Integration

### OAuth flow

1. User clicks "Connect GitHub"
2. Redirect to GitHub OAuth: `https://github.com/login/oauth/authorize?client_id=YOUR_ID&scope=repo,read:user`
3. GitHub redirects back to `/api/github/callback?code=xxx`
4. Server exchanges the code for an access token
5. Token is stored in the `github_accounts` table (encrypted)

### server/routes/github.js

```javascript
const express = require('express');
const router  = express.Router();
const fetch   = require('node-fetch');
const auth    = require('../middleware/auth');

// Step 1: Redirect to GitHub
router.get('/connect', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,read:user`;
  res.redirect(url);
});

// Step 2: Callback from GitHub
router.get('/callback', auth, async (req, res, next) => {
  try {
    const { code } = req.query;
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      })
    });
    const { access_token } = await tokenRes.json();

    // Fetch GitHub user
    const userRes  = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const ghUser = await userRes.json();

    // Store in database (never expose access_token to the client)
    await supabase.from('github_accounts').upsert({
      user_id: req.user.id,
      github_user_id: String(ghUser.id),
      username: ghUser.login,
      access_token, // encrypt before storing in production
    });

    res.redirect('/src/pages/github.html?connected=true');
  } catch (err) { next(err); }
});

// GET /api/github/repos
router.get('/repos', auth, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('github_accounts')
      .select('access_token, username')
      .eq('user_id', req.user.id)
      .single();

    const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const repos = await reposRes.json();
    res.json(repos.map(r => ({
      id: r.id, name: r.name, description: r.description,
      language: r.language, stars: r.stargazers_count,
      forks: r.forks_count, url: r.html_url,
      updatedAt: r.updated_at,
    })));
  } catch (err) { next(err); }
});

module.exports = router;
```

> **Security:** Never store raw OAuth tokens in the client. Never expose the GitHub access token in API responses that go to the browser. Store it server-side only.

---

## 13. AI Assistant

The AI assistant uses OpenAI's API server-side. Never put your API key in client-side JavaScript.

### server/routes/ai.js

```javascript
const express = require('express');
const router  = express.Router();
const OpenAI  = require('openai');
const auth    = require('../middleware/auth');
const supabase = require('../services/supabase');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', auth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Build context from user's data
    const [{ data: projects }, { data: tasks }] = await Promise.all([
      supabase.from('projects').select('name, status, progress, description').eq('owner_id', req.user.id).limit(10),
      supabase.from('tasks').select('title, status, priority').eq('user_id', req.user.id).neq('status', 'done').limit(20),
    ]);

    const systemPrompt = `You are DevVault AI, a developer productivity assistant.
The user's active projects: ${JSON.stringify(projects?.slice(0,5))}
The user's pending tasks: ${JSON.stringify(tasks?.slice(0,10))}
Be concise, helpful, and developer-focused.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) { next(err); }
});

module.exports = router;
```

### Frontend call

```javascript
async function sendToAI(message) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message }),
  });
  const { reply } = await res.json();
  return reply;
}
```

---

## 14. Environment Variables

Create a `.env` file in the project root. **Never commit this file to Git.**

```env
# Server
PORT=3001
ALLOWED_ORIGIN=http://localhost:3001

# Supabase (server-side — keep the service role key secret)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_app_client_id
GITHUB_CLIENT_SECRET=your_github_app_client_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend (these can be public — anon key only)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Security rules

| Rule | Reason |
|------|--------|
| Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend | It bypasses RLS and has admin access |
| Never put `OPENAI_API_KEY` in client-side JS | Anyone could steal and use your credits |
| Never put `GITHUB_CLIENT_SECRET` in client-side JS | OAuth security |
| Rotate keys if accidentally committed | Use `git filter-repo` to purge history |

### .env.example (commit this — no real values)

```env
PORT=3001
ALLOWED_ORIGIN=http://localhost:3001
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=sk-your_openai_key_here
```

---

## 15. Deployment

### Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set your environment variables in Vercel → Settings → Environment Variables
4. Vercel will auto-detect Node.js and deploy

**vercel.json**

```json
{
  "version": 2,
  "builds": [
    { "src": "server/server.js", "use": "@vercel/node" },
    { "src": "src/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/server.js" },
    { "src": "/(.*)", "dest": "src/$1" }
  ]
}
```

### package.json scripts

```json
{
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js",
    "serve": "npx serve src/pages -p 8080"
  }
}
```

### Alternative static hosting (frontend only)

The frontend works without a backend — just open `src/pages/index.html` directly or serve the `src/` folder with any static host:

```bash
# Using VS Code Live Server extension (simplest)
# Just right-click index.html → Open with Live Server

# Using npx serve
npx serve src/pages

# Using Python
cd src/pages && python -m http.server 8080
```

---

## 16. Roadmap

### MVP (v1) — ✅ Built

- [x] Authentication (sign up, sign in, reset)
- [x] Dashboard with stats and activity
- [x] Projects (create, edit, delete, progress)
- [x] Tasks with Kanban board and drag-and-drop
- [x] Notes with Markdown editor and auto-save
- [x] Documentation per project
- [x] Learning tracker
- [x] Developer analytics with charts
- [x] AI Assistant (simulated, OpenAI-ready)
- [x] Portfolio page
- [x] Settings with profile, preferences, export

### v2 — GitHub Integration

- [ ] GitHub OAuth connect
- [ ] Repository sync
- [ ] Commit activity
- [ ] Real contribution heatmap

### v3 — AI Features

- [ ] OpenAI integration (server-side)
- [ ] AI project planner
- [ ] AI README generator
- [ ] AI documentation generator
- [ ] Context-aware task recommendations

### v4 — Cloud Sync

- [ ] Supabase backend fully wired
- [ ] Multi-device sync
- [ ] Real-time updates
- [ ] Public project pages (`/projects/homehive`)
- [ ] Team collaboration

---

## Design System

### Colors

```css
--bg:       #0A0A0F   /* Page background */
--surface:  #111118   /* Cards, sidebar */
--elevated: #181821   /* Elevated surfaces */
--border:   #272733   /* Borders */
--primary:  #7C5CFF   /* Purple accent */
--success:  #22C55E   /* Green */
--warning:  #F59E0B   /* Amber */
--danger:   #EF4444   /* Red */
--info:     #3B82F6   /* Blue */
--text:     #F5F5F7   /* Primary text */
--muted:    #8B8B98   /* Muted text */
```

### Typography

- Font: **Inter** (Google Fonts)
- Code: **JetBrains Mono**
- Scale: 0.72rem → 0.78rem → 0.85rem → 0.875rem → 1rem → 1.1rem → 1.35rem → 1.6rem → 1.75rem

---

## Contributing

DevVault is a personal YouTube project. Issues and PRs welcome if you're following along with the series.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built by [John Were](https://github.com/john) as a YouTube coding series project.*
