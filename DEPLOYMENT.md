# Deployment Guide — Job Hours Tracker

This guide walks you through deploying the Job Hours Tracker to **Vercel's free tier** with **Neon PostgreSQL**.

---

## Prerequisites

Before you begin, make sure you have:

1. **A GitHub account** — [Sign up at github.com](https://github.com/signup) if you don't have one
2. **A Vercel account** — [Sign up at vercel.com](https://vercel.com/signup) (sign in with your GitHub account for easiest setup)
3. **A Neon account** — [Sign up at neon.tech](https://neon.tech/) (free tier is sufficient)
4. **Git installed** on your computer — [Download Git](https://git-scm.com/downloads)
5. **Node.js 18+** installed — [Download Node.js](https://nodejs.org/)

---

## Step 1: Set Up Neon PostgreSQL

If you already have a Neon database and connection string, skip to Step 2.

### 1.1 Create a Neon Account

1. Go to [neon.tech](https://neon.tech/)
2. Click **Sign Up** (you can use your GitHub account)
3. You'll be taken to the Neon Console dashboard

### 1.2 Create a New Project

1. Click **New Project** (or it may create one automatically)
2. **Project name**: `job-hours-tracker` (or any name you prefer)
3. **Region**: Choose the one closest to you (e.g., `eu-central-1` for Europe)
4. **Database name**: Leave as `neondb` (default) or change if you prefer
5. Click **Create Project**

### 1.3 Get Your Connection String

1. After creating the project, Neon shows a **Connection Details** panel
2. Make sure the **Connection string** tab is selected
3. Copy the connection string — it looks like this:
   ```
   postgresql://neondb_owner:your_password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save this string** — you'll need it for the next steps

> **Important**: Never share this connection string or commit it to Git. It contains your database password.

---

## Step 2: Configure the Local Environment

1. In the `job-hours-tracker` folder, create a file called `.env.local`
2. Add your connection string:

```
DATABASE_URL="postgresql://neondb_owner:your_password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
```

> This file is already listed in `.gitignore` and will not be committed to Git.

---

## Step 3: Verify the Project Works Locally

```bash
cd job-hours-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**What to check:**
- The page loads with a calendar showing the current month
- The database tables are created automatically (you'll see the spinner briefly, then the calendar)
- Try clicking a day, entering hours, and saving
- Refresh the page — the hours should still be there

If you see an error like "Could not connect to database":
- Double-check your `DATABASE_URL` in `.env.local`
- Make sure there are no extra spaces or quotes issues
- Verify your Neon database is active in the Neon Console

### Build test

```bash
npm run build
```

If the build succeeds with no errors, you're ready to deploy.

---

## Step 4: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `job-hours-tracker`
3. **Visibility**: Private (recommended)
4. **Do NOT** check "Add a README file" (we already have one)
5. Click **Create repository**

---

## Step 5: Push the Project to GitHub

```bash
cd job-hours-tracker

git init
git add .
git commit -m "Initial commit: Job Hours Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/job-hours-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 6: Import the Project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Find `job-hours-tracker` and click **Import**

If you don't see your repository:
- Click **Adjust GitHub App Permissions**
- Grant Vercel access to the repository
- Come back and click **Import**

---

## Step 7: Add the Environment Variable in Vercel

On the project configuration page, **before clicking Deploy**:

1. Scroll down to the **Environment Variables** section
2. Add the following:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:your_password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require` |

3. Make sure it's enabled for **Production**, **Preview**, and **Development**
4. Click **Add**

> **This is the most important step.** Without this environment variable, the app will not be able to connect to the database.

---

## Step 8: Configure Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (should be auto-detected) |
| **Root Directory** | `.` (leave as default) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | Leave blank (default) |

Click **Deploy**.

---

## Step 9: Wait for Deployment

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the project
4. Deploy it

This usually takes 30–60 seconds.

---

## Step 10: Verify the Deployed Application

1. Click the link Vercel gives you (something like `job-hours-tracker-xxxxx.vercel.app`)
2. The page should load with the current month calendar
3. Click a day, enter hours, save
4. Refresh the page — hours should persist
5. Open the page on another device or browser — same data should appear
6. Try navigating between months

---

## Redeploying After Changes

Whenever you push changes to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Description of what you changed"
git push
```

Vercel detects the push and redeploys within about a minute.

---

## Verifying the Database in Neon Console

You can inspect your data directly in Neon:

1. Go to [console.neon.tech](https://console.neon.tech/)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Try these queries:

```sql
-- See all entries
SELECT * FROM work_entries ORDER BY date;

-- See settings
SELECT * FROM app_settings;

-- Count entries by month
SELECT 
  date_trunc('month', date) AS month, 
  COUNT(*) AS entries, 
  SUM(hours) AS total_hours 
FROM work_entries 
GROUP BY month 
ORDER BY month;
```

---

## Custom Domain (Optional)

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Domains**
3. Add your domain
4. Follow Vercel's instructions to update your DNS records

---

## Troubleshooting

### "Could not connect to database" on Vercel
- Go to Vercel Dashboard → your project → **Settings** → **Environment Variables**
- Verify `DATABASE_URL` is set correctly
- Make sure it's enabled for the **Production** environment
- Redeploy after making changes: go to **Deployments** → click the **⋮** menu on the latest deployment → **Redeploy**

### First load is slow (1-2 seconds)
- Neon's free tier suspends databases after 5 minutes of inactivity
- The database auto-resumes on the next connection, which takes 1-2 seconds
- Subsequent requests are fast
- This is a limitation of the free tier

### Build failed on Vercel
- Check the build logs in the Vercel dashboard
- Make sure the build works locally first (`npm run build`)
- Ensure Node.js 18+ is being used

### Data disappeared
- Check the Neon Console — is the database still active?
- The Neon free tier keeps your data permanently, but suspends compute after inactivity
- Your data is safe; the database just needs to wake up
