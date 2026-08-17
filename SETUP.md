# DevVault Setup Guide

Complete setup instructions for running DevVault locally and deploying to Netlify with Supabase.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Supabase Database Setup](#supabase-database-setup)
3. [Netlify Deployment](#netlify-deployment)
4. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- A modern browser (Chrome, Firefox, Edge)

### Steps

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\FOLIO\Desktop\TEST\devvault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3001
   ```

### Running Without Backend

DevVault can run entirely in the browser using localStorage:

1. Simply open `src/pages/login.html` directly in your browser
2. All data will be stored locally
3. **No backend or database required for basic testing**

---

## Supabase Database Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project name:** `devvault` (or any name)
   - **Database password:** Choose a strong password (save it!)
   - **Region:** Select closest to you
4. Click **"Create new project"** and wait 1-2 minutes

### Step 2: Get Your API Keys

1. In your Supabase dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) ⚠️ Keep this secret!

### Step 3: Configure Environment Variables

1. Open your `.env` file
2. Paste your keys:
   ```env
   PORT=3001
   
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your_service_role_key
   
   # Optional: OpenAI for AI features
   OPENAI_API_KEY=sk-your_openai_key
   
   # Optional: GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**

3. **Run schema.sql:**
   - Open `database/schema.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **"Run"**
   - ✓ Should see "Success. No rows returned"

4. **Run policies.sql:**
   - Open `database/policies.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **"Run"**
   - ✓ Should see "Success"

5. **Run seed.sql (optional - for demo data):**
   - First, **sign up** in your app to create a user
   - Go to Supabase → **Authentication** → **Users**
   - Copy your **UUID** (looks like `123e4567-e89b-12d3-a456-426614174000`)
   - Open `database/seed.sql`
   - **Replace** `YOUR_USER_UUID_HERE` with your UUID
   - Copy ALL contents → paste in SQL Editor → Run

### Step 5: Enable Row Level Security

1. In Supabase, go to **Table Editor**
2. For each table (`profiles`, `projects`, `tasks`, `notes`, `learning_items`, `activity_log`):
   - Click the table name
   - Click **RLS** (Row Level Security) toggle
   - Ensure it says **"RLS enabled"** ✓

### Step 6: Test the Connection

1. Restart your dev server: `npm run dev`
2. Open `http://localhost:3001`
3. Sign up with a new account
4. If you see your dashboard → **Success!** ✓

---

## Netlify Deployment

### Step 1: Prepare Your Repository

1. **Initialize git (if not already):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create a new repo on GitHub
   - Follow GitHub's instructions to push your code

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your `devvault` repository

### Step 3: Configure Build Settings

In Netlify's build settings, enter:

- **Build command:** `npm run build`
- **Publish directory:** `dist` or `src` (depending on your setup)
- **Base directory:** (leave empty)

**For a frontend-only deployment:**
- **Build command:** (leave empty)
- **Publish directory:** `src`

### Step 4: Add Environment Variables

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOi...your_anon_key
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOi...your_service_role_key
```

⚠️ **Only add `SUPABASE_SERVICE_ROLE_KEY` if you're deploying the Node.js backend. Do NOT expose it to the frontend!**

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (~1-2 minutes)
3. Netlify will give you a URL like: `https://your-site.netlify.app`

### Step 6: Update Supabase CORS Settings

1. Go to Supabase → **Settings** → **API**
2. Scroll to **CORS settings**
3. Add your Netlify URL:
   ```
   https://your-site.netlify.app
   ```
4. Save changes

### Step 7: Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. Follow instructions to point your domain to Netlify
3. Enable **HTTPS** (automatic with Let's Encrypt)

---

## Troubleshooting

### Buttons Not Working

**Issue:** Clicking buttons does nothing.

**Solution:**
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Common issues:
   - **"Cannot read property 'addEventListener' of null"** → Element ID mismatch
   - **"Unexpected token"** → Syntax error in JavaScript
   - **Module errors** → Check file paths in imports

**Quick fix for testing:**
- Open `src/pages/login.html` directly in browser
- This works without a server

### Database Connection Failed

**Issue:** "Error connecting to Supabase"

**Solutions:**
1. Check `.env` file has correct keys
2. Verify Supabase URL doesn't have trailing `/`
3. Restart server after changing `.env`
4. Check Supabase project is active (not paused)

### RLS Policy Errors

**Issue:** "new row violates row-level security policy"

**Solutions:**
1. Make sure you ran `policies.sql`
2. Verify RLS is enabled on all tables
3. Check user is authenticated
4. Re-run policies script if needed

### Build Errors on Netlify

**Issue:** Build fails with module errors

**Solution:**
```bash
# Add this to package.json
{
  "scripts": {
    "build": "echo 'No build needed for static site'"
  }
}
```

Then set Netlify **Build command** to: `npm run build`

### CORS Errors

**Issue:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Add your domain to Supabase CORS settings
2. Include both:
   - `http://localhost:3001` (local dev)
   - `https://your-site.netlify.app` (production)

---

## Next Steps

✓ **Local development working?** Start building!  
✓ **Supabase connected?** Your data is now persistent  
✓ **Deployed to Netlify?** Share your portfolio!

### Optional Enhancements

1. **Enable GitHub OAuth:**
   - Create GitHub OAuth app
   - Add credentials to Supabase Auth settings
   - Configure callback URL

2. **Add OpenAI:**
   - Get API key from [platform.openai.com](https://platform.openai.com)
   - Add to `.env`
   - Restart server
   - AI Assistant will now work

3. **Custom Domain:**
   - Buy a domain
   - Point it to Netlify
   - Enable HTTPS

---

## Need Help?

- Check the [README.md](README.md) for more info
- Open an issue on GitHub
- Review Supabase [documentation](https://supabase.com/docs)
- Check Netlify [support](https://docs.netlify.com)

---

**Happy coding! 🚀**
