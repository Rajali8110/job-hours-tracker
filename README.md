# Job Hours Tracker

A personal, lightweight web application to track daily working hours and monitor monthly progress. Built with Next.js and Neon PostgreSQL — data persists across devices and browsers.

## Features

- **Calendar view** — click any day to log hours worked
- **Monthly dashboard** — target, worked, remaining hours, progress bar, averages
- **Smart calculations** — automatically counts working days (Mon–Fri), calculates targets
- **Configurable** — set your expected hours/day, toggle weekend tracking, add public holidays
- **Decimal hours** — supports 7.5, 7.25, 8.5 etc.
- **Database-backed** — data persists across devices via Neon PostgreSQL
- **Export / Import** — backup your data as JSON
- **Responsive** — works on desktop and mobile
- **Dark theme** — clean, modern UI

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | JavaScript |
| Styling | Vanilla CSS (custom properties) |
| Database | [Neon PostgreSQL](https://neon.tech/) (free tier) |
| ORM/Driver | [@neondatabase/serverless](https://github.com/neondatabase/serverless) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Deployment | [Vercel](https://vercel.com/) (free tier) |

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- npm (comes with Node.js)
- A Neon PostgreSQL database (see [DEPLOYMENT.md](DEPLOYMENT.md) for setup)

### Setup

```bash
cd job-hours-tracker
npm install
```

Create a `.env.local` file in the project root:

```
DATABASE_URL="postgresql://your_user:your_password@your_host/your_db?sslmode=require"
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The database tables will be created automatically on first load.

### Build

```bash
npm run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string |

This is the only environment variable needed. Set it in `.env.local` for local development and in the Vercel dashboard for production.

## Database Schema

Two tables are created automatically:

**`work_entries`** — one row per day with hours worked:
```sql
CREATE TABLE work_entries (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  hours NUMERIC(5,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`app_settings`** — single row with JSON settings:
```sql
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Tables are created via the `/api/init` endpoint, which runs automatically when the app loads.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/init` | Initialize database tables |
| GET | `/api/entries?year=2026&month=8` | Get entries for a month |
| POST | `/api/entries` | Create/update an entry |
| DELETE | `/api/entries` | Delete an entry |
| GET | `/api/settings` | Get settings |
| POST | `/api/settings` | Update settings |
| GET | `/api/export` | Export all data as JSON |
| POST | `/api/export` | Import data from JSON |

## Project Structure

```
job-hours-tracker/
├── app/
│   ├── api/
│   │   ├── entries/route.js   # Work entries CRUD
│   │   ├── export/route.js    # Data export/import
│   │   ├── init/route.js      # Database initialization
│   │   └── settings/route.js  # Settings CRUD
│   ├── components/
│   │   ├── Calendar.js        # Monthly calendar grid
│   │   ├── Dashboard.js       # Stats overview
│   │   ├── DayModal.js        # Modal to enter/edit hours
│   │   └── Settings.js        # Settings panel + backup
│   ├── lib/
│   │   ├── dateUtils.js       # Date calculations
│   │   ├── db.js              # Neon database connection
│   │   └── storage.js         # API client (frontend → API)
│   ├── globals.css            # All styles
│   ├── layout.js              # Root layout
│   └── page.js                # Main page
├── .env.local                 # Environment variables (not committed)
├── DEPLOYMENT.md              # Deployment guide
├── README.md                  # This file
├── next.config.mjs
└── package.json
```

## Configuration Defaults

| Setting | Default | Rationale |
|---------|---------|-----------|
| Hours per working day | 7.8 | 39-hour work week ÷ 5 days |
| Include weekends | No | Standard Mon–Fri schedule |
| Public holidays | None | Add in Settings as needed |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step guide.

**Quick version:**
1. Create a GitHub repository and push this project
2. Import the repository in [Vercel](https://vercel.com/)
3. Add `DATABASE_URL` as an environment variable in Vercel
4. Deploy

## Troubleshooting

### "Could not connect to database" error
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active (it may suspend after inactivity on the free tier — it auto-resumes on the next connection)
- Make sure the connection string includes `sslmode=require`

### Data not showing on the calendar
- Open browser DevTools (F12) → Network tab → check for failed API requests
- Look at the Vercel function logs for error details

### Build fails
Make sure you're using Node.js 18 or later:
```bash
node --version
```

### Neon database suspended
Neon's free tier suspends databases after 5 minutes of inactivity. They auto-resume on the next connection (may take 1-2 seconds on first load).

## License

Personal project. Use however you like.
