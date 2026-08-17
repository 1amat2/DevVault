/**
 * DevVault Data Store
 * localStorage-backed store. All pages read/write through this module.
 */

// ─── Seed data ──────────────────────────────────────────────────────────────

const SEED = {
  projects: [
    { id:'p1', name:'HomeHive', slug:'homehive', description:'Property marketplace connecting tenants and landlords.', status:'active', category:'Web', progress:65, tech:['Next.js','Supabase','Tailwind CSS'], repo:'', live:'', color:'#22C55E', icon:'🏠', createdAt: daysAgo(42), updatedAt: hoursAgo(2) },
    { id:'p2', name:'DevVault', slug:'devvault', description:'Developer dashboard to manage projects and life.', status:'active', category:'Web', progress:80, tech:['HTML','CSS','JavaScript','Node.js'], repo:'', live:'', color:'#7C5CFF', icon:'⚡', createdAt: daysAgo(30), updatedAt: hoursAgo(5) },
    { id:'p3', name:'MinePanel', slug:'minepanel', description:'Minecraft server manager and dashboard.', status:'hold', category:'Web', progress:50, tech:['Node.js','Express','MongoDB'], repo:'', live:'', color:'#F59E0B', icon:'🎮', createdAt: daysAgo(60), updatedAt: daysAgo(14) },
    { id:'p4', name:'TradeLab', slug:'tradelab', description:'Trading analysis and backtesting platform.', status:'active', category:'Backend', progress:40, tech:['Python','Pandas','PostgreSQL'], repo:'', live:'', color:'#3B82F6', icon:'📈', createdAt: daysAgo(20), updatedAt: daysAgo(2) },
    { id:'p5', name:'StudyOS', slug:'studyos', description:'Student productivity and learning platform.', status:'active', category:'Web', progress:20, tech:['Python','Django','SQLite'], repo:'', live:'', color:'#EC4899', icon:'🎓', createdAt: daysAgo(10), updatedAt: daysAgo(3) },
    { id:'p6', name:'ClipForge', slug:'clipforge', description:'AI tool to turn long videos into short clips.', status:'completed', category:'AI', progress:100, tech:['Python','FastAPI','FFmpeg'], repo:'', live:'', color:'#EF4444', icon:'✂️', createdAt: daysAgo(90), updatedAt: daysAgo(20) },
  ],
  tasks: [
    { id:'t1', projectId:'p1', title:'Finish authentication flow', description:'Complete Supabase Auth with email verification and session management.', status:'in-progress', priority:'critical', dueDate: daysAgoDate(-3), createdAt: daysAgo(5), updatedAt: hoursAgo(1) },
    { id:'t2', projectId:'p1', title:'Design landing page', description:'Create a compelling hero section with property search.', status:'todo', priority:'high', dueDate: daysAgoDate(-7), createdAt: daysAgo(8), updatedAt: daysAgo(2) },
    { id:'t3', projectId:'p1', title:'Add email verification', description:'Send verification email on signup using Resend.', status:'todo', priority:'high', dueDate: daysAgoDate(-5), createdAt: daysAgo(6), updatedAt: daysAgo(1) },
    { id:'t4', projectId:'p1', title:'Setup database schema', description:'Create all PostgreSQL tables with proper RLS policies.', status:'todo', priority:'medium', dueDate: daysAgoDate(-10), createdAt: daysAgo(10), updatedAt: daysAgo(3) },
    { id:'t5', projectId:'p1', title:'Property listing page', description:'Grid/list view of available properties with filters.', status:'in-progress', priority:'medium', dueDate: daysAgoDate(-14), createdAt: daysAgo(12), updatedAt: hoursAgo(4) },
    { id:'t6', projectId:'p1', title:'Image upload', description:'Property photo upload using Supabase Storage.', status:'in-progress', priority:'medium', dueDate: daysAgoDate(-10), createdAt: daysAgo(9), updatedAt: hoursAgo(6) },
    { id:'t7', projectId:'p1', title:'User dashboard', description:'Tenant and landlord dashboard with stats.', status:'review', priority:'medium', dueDate: daysAgoDate(-5), createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id:'t8', projectId:'p1', title:'Messaging system', description:'Real-time chat between tenants and landlords.', status:'review', priority:'low', dueDate: daysAgoDate(-20), createdAt: daysAgo(18), updatedAt: daysAgo(2) },
    { id:'t9', projectId:'p1', title:'Project setup', description:'Init repo, install deps, configure linting.', status:'done', priority:'low', dueDate: daysAgoDate(40), createdAt: daysAgo(42), updatedAt: daysAgo(40) },
    { id:'t10', projectId:'p1', title:'Configure Tailwind', description:'Setup Tailwind CSS with custom theme.', status:'done', priority:'low', dueDate: daysAgoDate(38), createdAt: daysAgo(40), updatedAt: daysAgo(38) },
    { id:'t11', projectId:'p1', title:'Install dependencies', description:'Install all required npm packages.', status:'done', priority:'low', dueDate: daysAgoDate(39), createdAt: daysAgo(41), updatedAt: daysAgo(39) },
    { id:'t12', projectId:'p1', title:'Create README', description:'Write project documentation.', status:'done', priority:'low', dueDate: daysAgoDate(35), createdAt: daysAgo(38), updatedAt: daysAgo(35) },
    { id:'t13', projectId:'p2', title:'Build sidebar component', description:'Reusable sidebar with active states.', status:'done', priority:'high', dueDate: daysAgoDate(25), createdAt: daysAgo(30), updatedAt: daysAgo(25) },
    { id:'t14', projectId:'p2', title:'Build data layer', description:'localStorage-backed data store.', status:'done', priority:'high', dueDate: daysAgoDate(15), createdAt: daysAgo(20), updatedAt: daysAgo(10) },
    { id:'t15', projectId:'p2', title:'Build dashboard page', description:'Stats, charts, activity feed.', status:'in-progress', priority:'high', dueDate: daysAgoDate(-2), createdAt: daysAgo(10), updatedAt: hoursAgo(2) },
    { id:'t16', projectId:'p3', title:'Payment integration', description:'Add Stripe payment processing.', status:'backlog', priority:'low', dueDate: null, createdAt: daysAgo(30), updatedAt: daysAgo(14) },
    { id:'t17', projectId:'p3', title:'SEO improvements', description:'Meta tags, sitemap, structured data.', status:'backlog', priority:'medium', dueDate: null, createdAt: daysAgo(25), updatedAt: daysAgo(14) },
    { id:'t18', projectId:'p4', title:'Backtesting engine', description:'Core algorithm for strategy testing.', status:'in-progress', priority:'critical', dueDate: daysAgoDate(-5), createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id:'t19', projectId:'p4', title:'Chart visualization', description:'Candlestick charts with indicators.', status:'todo', priority:'high', dueDate: daysAgoDate(-10), createdAt: daysAgo(12), updatedAt: daysAgo(5) },
  ],
  notes: [
    { id:'n1', title:'JavaScript Async/Await', category:'JavaScript', content:`## JavaScript Async/Await\n\nAsync/await is syntactic sugar over Promises.\n\n\`\`\`javascript\nasync function getUser() {\n  const res = await fetch('/api/auth/me');\n  const data = await res.json();\n  return data;\n}\n\ngetUser().then(user => console.log(user));\n\`\`\`\n\n## Key Points\n\n- \`async\` functions always return a Promise\n- \`await\` pauses execution until the Promise resolves\n- Use try/catch for error handling\n\n## Error Handling\n\n\`\`\`javascript\nasync function fetchData() {\n  try {\n    const res = await fetch('/api/data');\n    return await res.json();\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}\n\`\`\``, pinned:true, createdAt: daysAgo(45), updatedAt: daysAgo(1) },
    { id:'n2', title:'Supabase Row Level Security', category:'Supabase', content:`## Supabase Row Level Security\n\nRLS controls which rows a user can access in PostgreSQL.\n\n\`\`\`sql\nCREATE POLICY "Users can view their own profile"\nON profiles\nFOR SELECT\nUSING (auth.uid() = id);\n\`\`\`\n\n## Enable RLS\n\n\`\`\`sql\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\n\`\`\`\n\n## Insert Policy\n\n\`\`\`sql\nCREATE POLICY "Users can insert own profile"\nON profiles FOR INSERT\nWITH CHECK (auth.uid() = id);\n\`\`\``, pinned:true, createdAt: daysAgo(30), updatedAt: hoursAgo(2) },
    { id:'n3', title:'Useful Git Commands', category:'Git', content:`## Useful Git Commands\n\n\`\`\`bash\n# Status and log\ngit status\ngit log --oneline --graph\n\n# Branches\ngit checkout -b feature/new-feature\ngit merge feature/new-feature\ngit branch -d feature/done\n\n# Stash\ngit stash\ngit stash pop\n\n# Undo\ngit reset --soft HEAD~1  # undo last commit, keep changes\ngit restore .             # discard all unstaged changes\n\`\`\``, pinned:false, createdAt: daysAgo(20), updatedAt: daysAgo(2) },
    { id:'n4', title:'Docker Basics', category:'DevOps', content:`## Docker Basics\n\n\`\`\`bash\n# Build\ndocker build -t myapp .\n\n# Run\ndocker run -p 3000:3000 myapp\ndocker run -d --name myapp -p 3000:3000 myapp\n\n# Manage\ndocker ps\ndocker stop myapp\ndocker rm myapp\ndocker logs myapp\n\`\`\`\n\n## Docker Compose\n\n\`\`\`yaml\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n\`\`\``, pinned:false, createdAt: daysAgo(15), updatedAt: daysAgo(3) },
    { id:'n5', title:'PostgreSQL Cheatsheet', category:'Supabase', content:`## PostgreSQL Cheatsheet\n\n\`\`\`sql\n-- Create table\nCREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email TEXT UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Query\nSELECT * FROM users WHERE email = 'test@example.com';\n\n-- Insert\nINSERT INTO users (email) VALUES ('new@example.com');\n\n-- Update\nUPDATE users SET email = 'new@example.com' WHERE id = '...';\n\n-- Delete\nDELETE FROM users WHERE id = '...';\n\`\`\``, pinned:false, createdAt: daysAgo(12), updatedAt: daysAgo(4) },
    { id:'n6', title:'Node.js Project Structure', category:'Node.js', content:`## Node.js Express Structure\n\n\`\`\`\nproject/\n├── src/\n│   ├── routes/\n│   │   ├── auth.js\n│   │   └── projects.js\n│   ├── controllers/\n│   ├── middleware/\n│   │   ├── auth.js\n│   │   └── errorHandler.js\n│   ├── models/\n│   └── utils/\n├── .env\n├── .gitignore\n└── server.js\n\`\`\``, pinned:false, createdAt: daysAgo(8), updatedAt: daysAgo(5) },
  ],
  activity: [
    { id:'a1', type:'commit', text:'Pushed 2 commits to HomeHive', project:'HomeHive', projectId:'p1', time: hoursAgo(2) },
    { id:'a2', type:'branch', text:'Created new branch feature/messaging', project:'HomeHive', projectId:'p1', time: hoursAgo(5) },
    { id:'a3', type:'task',   text:'Moved "User dashboard" to Review', project:'HomeHive', projectId:'p1', time: daysAgo(1) },
    { id:'a4', type:'note',   text:'Updated note: Supabase Row Level Security', project:'DevVault', projectId:'p2', time: hoursAgo(2) },
    { id:'a5', type:'commit', text:'Updated README.md', project:'DevVault', projectId:'p2', time: daysAgo(1) },
    { id:'a6', type:'issue',  text:'Closed issue #42 — Auth bug', project:'HomeHive', projectId:'p1', time: daysAgo(2) },
    { id:'a7', type:'task',   text:'Completed "Configure Tailwind"', project:'DevVault', projectId:'p2', time: daysAgo(3) },
    { id:'a8', type:'commit', text:'Initial commit — MinePanel', project:'MinePanel', projectId:'p3', time: daysAgo(60) },
  ],
  profile: {
    name: 'Dev User',
    handle: '@devuser',
    email: '',
    bio: 'Developer building things and documenting the journey.',
    avatar: '',
    location: '',
    website: '',
    github: '',
    streak: 0,
    totalCommits: 0,
    totalTasks: 0,
  }
};

// ─── Date helpers ────────────────────────────────────────────────────────────

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString();
}
function daysAgoDate(n) {
  // negative = future
  return new Date(Date.now() - n * 86400000).toISOString().split('T')[0];
}

// ─── Store ───────────────────────────────────────────────────────────────────

function load(key) {
  try {
    const raw = localStorage.getItem('dv_' + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(key, value) {
  try { localStorage.setItem('dv_' + key, JSON.stringify(value)); } catch {}
}

function init() {
  if (!load('seeded')) {
    save('projects', SEED.projects);
    save('tasks',    SEED.tasks);
    save('notes',    SEED.notes);
    save('activity', SEED.activity);
    save('profile',  SEED.profile);
    save('seeded',   true);
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const Projects = {
  all()         { return load('projects') || []; },
  get(id)       { return this.all().find(p => p.id === id); },
  active()      { return this.all().filter(p => p.status === 'active'); },
  byStatus(s)   { return this.all().filter(p => p.status === s); },

  create(data) {
    const projects = this.all();
    const p = { id: 'p' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 0, ...data };
    projects.unshift(p);
    save('projects', projects);
    logActivity({ type:'project', text:`Created project "${p.name}"`, project: p.name, projectId: p.id });
    return p;
  },

  update(id, data) {
    const projects = this.all().map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save('projects', projects);
    logActivity({ type:'project', text:`Updated project "${data.name || id}"`, project: data.name || id, projectId: id });
  },

  delete(id) {
    const p = this.get(id);
    save('projects', this.all().filter(p => p.id !== id));
    if (p) logActivity({ type:'project', text:`Deleted project "${p.name}"`, project: p.name, projectId: id });
  },
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const Tasks = {
  all()            { return load('tasks') || []; },
  get(id)          { return this.all().find(t => t.id === id); },
  forProject(pid)  { return this.all().filter(t => t.projectId === pid); },
  byStatus(s)      { return this.all().filter(t => t.status === s); },
  pending()        { return this.all().filter(t => t.status !== 'done'); },

  create(data) {
    const tasks = this.all();
    const t = { id: 't' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status:'todo', priority:'medium', ...data };
    tasks.unshift(t);
    save('tasks', tasks);
    logActivity({ type:'task', text:`Created task "${t.title}"`, project: t.projectId, projectId: t.projectId });
    return t;
  },

  update(id, data) {
    const tasks = this.all().map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t);
    save('tasks', tasks);
  },

  move(id, newStatus) {
    const t = this.get(id);
    this.update(id, { status: newStatus });
    if (t) logActivity({ type:'task', text:`Moved "${t.title}" to ${newStatus}`, project: t.projectId, projectId: t.projectId });
    // Auto-update project progress
    if (t?.projectId) recalcProgress(t.projectId);
  },

  delete(id) {
    const t = this.get(id);
    save('tasks', this.all().filter(t => t.id !== id));
    if (t?.projectId) recalcProgress(t.projectId);
  },
};

// ─── Notes ───────────────────────────────────────────────────────────────────

export const Notes = {
  all()      { return load('notes') || []; },
  get(id)    { return this.all().find(n => n.id === id); },
  byCategory(cat) { return cat === 'All Notes' ? this.all() : this.all().filter(n => n.category === cat); },
  search(q)  { const lq = q.toLowerCase(); return this.all().filter(n => n.title.toLowerCase().includes(lq) || n.content.toLowerCase().includes(lq)); },
  categories() {
    const cats = {};
    this.all().forEach(n => { cats[n.category] = (cats[n.category] || 0) + 1; });
    return cats;
  },

  create(data) {
    const notes = this.all();
    const n = { id: 'n' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false, ...data };
    notes.unshift(n);
    save('notes', notes);
    logActivity({ type:'note', text:`Created note "${n.title}"`, project:'DevVault', projectId:'p2' });
    return n;
  },

  update(id, data) {
    const notes = this.all().map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n);
    save('notes', notes);
  },

  delete(id) {
    save('notes', this.all().filter(n => n.id !== id));
  },
};

// ─── Activity ─────────────────────────────────────────────────────────────────

export const Activity = {
  all()   { return load('activity') || []; },
  recent(n=10) { return this.all().slice(0, n); },
};

function logActivity(entry) {
  const activity = Activity.all();
  activity.unshift({ id: 'a' + Date.now(), time: new Date().toISOString(), ...entry });
  save('activity', activity.slice(0, 50)); // keep last 50
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const Profile = {
  get()       { return load('profile') || SEED.profile; },
  update(data){ save('profile', { ...this.get(), ...data }); },
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export const Stats = {
  compute() {
    const projects = Projects.all();
    const tasks    = Tasks.all();
    const profile  = Profile.get();
    return {
      activeProjects:    projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      pendingTasks:      tasks.filter(t => t.status !== 'done').length,
      doneTasks:         tasks.filter(t => t.status === 'done').length,
      streak:            profile.streak,
      totalCommits:      profile.totalCommits,
      totalTasks:        profile.totalTasks,
      commitsThisWeek:   23,
      codingHours:       '18h 45m',
    };
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recalcProgress(projectId) {
  const tasks   = Tasks.forProject(projectId);
  if (!tasks.length) return;
  const done    = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);
  Projects.update(projectId, { progress });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)    return 'just now';
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 10080) return `${Math.floor(m / 1440)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export const PRIORITY_ORDER = { critical:0, high:1, medium:2, low:3 };

export function priorityColor(p) {
  return { critical:'var(--danger)', high:'var(--warning)', medium:'var(--info)', low:'var(--success)' }[p] || 'var(--text-muted)';
}

export function statusBadge(s) {
  const map = {
    active:    'badge-success',
    hold:      'badge-warning',
    completed: 'badge-muted',
    planning:  'badge-info',
    archived:  'badge-muted',
    idea:      'badge-info',
  };
  return map[s] || 'badge-muted';
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
init();
