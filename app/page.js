'use client';

import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import DayModal from './components/DayModal';
import Settings from './components/Settings';
import {
  getEntriesForMonth,
  saveEntry,
  deleteEntry,
  getSettings,
  saveSettings as persistSettings,
  initDB,
} from './lib/storage';
import {
  getMonthName,
  getWorkingDays,
  formatHours,
} from './lib/dateUtils';

const QUOTES = [
  "You can do it!",
  "I love you a lot ❤️",
  "Have a wonderful day at work!",
  "You are amazing!",
  "Keep up the great work!",
  "Every day is a fresh start.",
  "You're doing better than you think.",
  "I believe in you!",
];

export default function Home() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState({});
  const [settings, setSettings] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);
  const [quote, setQuote] = useState('');

  // Initialize database and load settings on mount
  useEffect(() => {
    // Pick random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    async function init() {
      try {
        await initDB();
        setDbReady(true);
        const s = await getSettings();
        setSettings(s);
        setMounted(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Could not connect to database. Please check your configuration.');
      }
    }
    init();
  }, []);

  // Reload entries when month changes or after init
  useEffect(() => {
    if (mounted && dbReady) {
      loadEntries();
    }
  }, [currentYear, currentMonth, mounted, dbReady]);

  async function loadEntries() {
    try {
      const data = await getEntriesForMonth(currentYear, currentMonth);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  }

  const navigateMonth = useCallback((direction) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + direction;
      let newYear = currentYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setCurrentYear(newYear);
      return newMonth;
    });
  }, [currentYear]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }, []);

  const handleDayClick = useCallback((dateStr, day) => {
    const hours = entries[dateStr] ?? null;
    setSelectedDay({ dateStr, day, hours });
  }, [entries]);

  const handleSaveHours = useCallback(async (dateStr, hours) => {
    try {
      await saveEntry(dateStr, hours);
      await loadEntries();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  }, [currentYear, currentMonth]);

  const handleDeleteHours = useCallback(async (dateStr) => {
    try {
      await deleteEntry(dateStr);
      await loadEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }, [currentYear, currentMonth]);

  const handleSaveSettings = useCallback(async (newSettings) => {
    try {
      const saved = await persistSettings(newSettings);
      setSettings(saved);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, []);

  const handleToggleHoliday = useCallback(async (dateStr, isHoliday) => {
    if (!settings) return;
    const currentHolidays = settings.holidays || [];
    let newHolidays;
    if (isHoliday) {
      newHolidays = currentHolidays.includes(dateStr) 
        ? currentHolidays 
        : [...currentHolidays, dateStr].sort();
    } else {
      newHolidays = currentHolidays.filter(h => h !== dateStr);
    }
    
    if (newHolidays.length !== currentHolidays.length) {
      const newSettings = { ...settings, holidays: newHolidays };
      await handleSaveSettings(newSettings);
    }
  }, [settings, handleSaveSettings]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === 'Merle@1234') {
      setIsLocked(false);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setPasswordInput('');
  };

  // Error state
  if (error) {
    return (
      <div className="app-loading">
        <div style={{ textAlign: 'center', padding: '20px', maxWidth: '400px' }}>
          <p style={{ color: '#f87171', marginBottom: '12px' }}>⚠ {error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!mounted || !settings) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <main className="app lock-screen">
        <div className="lock-container">
          <h1 className="lock-quote">{quote}</h1>
          <form onSubmit={handleUnlock} className="lock-form">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPassError(false);
              }}
              placeholder="Enter password"
              className={`modal-input lock-input ${passError ? 'error' : ''}`}
              autoFocus
            />
            {passError && <p className="modal-error">Incorrect password.</p>}
            <button type="submit" className="btn btn-primary lock-btn">
              Unlock Tracker
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Calculate dashboard stats
  const workingDays = getWorkingDays(
    currentYear,
    currentMonth,
    settings.includeWeekends,
    settings.holidays
  );
  const targetHours = Math.round(workingDays * settings.hoursPerDay * 100) / 100;
  const workedHours = Object.values(entries).reduce((sum, h) => sum + h, 0);
  const roundedWorked = Math.round(workedHours * 100) / 100;
  const remainingHours = Math.max(0, Math.round((targetHours - roundedWorked) * 100) / 100);
  const daysWithEntries = Object.keys(entries).length;
  const progressPercent = targetHours > 0 ? (roundedWorked / targetHours) * 100 : 0;
  const averageHours = daysWithEntries > 0
    ? Math.round((roundedWorked / daysWithEntries) * 100) / 100
    : 0;

  const stats = {
    monthName: getMonthName(currentMonth),
    year: currentYear,
    targetHours,
    workedHours: roundedWorked,
    remainingHours,
    workingDays,
    daysWithEntries,
    progressPercent,
    averageHours,
  };

  return (
    <main className="app">
      <nav className="top-bar">
        <div className="month-nav">
          <button
            className="nav-btn"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2 className="month-title">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <button
            className="nav-btn"
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <div className="top-bar-actions">
          <button className="btn btn-ghost" onClick={goToToday}>
            Today
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleLock}
            aria-label="Lock App"
            title="Lock App"
          >
            🔒
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </nav>

      <Dashboard stats={stats} />

      <Calendar
        year={currentYear}
        month={currentMonth}
        entries={entries}
        holidays={settings.holidays}
        includeWeekends={settings.includeWeekends}
        onDayClick={handleDayClick}
      />

      <footer className="app-footer">
        <p>
          {formatHours(settings.hoursPerDay)}h/day · {settings.includeWeekends ? 'Weekends included' : 'Mon–Fri only'}
          {settings.holidays.length > 0 && ` · ${settings.holidays.length} holiday${settings.holidays.length > 1 ? 's' : ''}`}
        </p>
      </footer>

      {selectedDay && (
        <DayModal
          dateStr={selectedDay.dateStr}
          day={selectedDay.day}
          month={currentMonth}
          year={currentYear}
          currentHours={selectedDay.hours}
          isHoliday={settings.holidays.includes(selectedDay.dateStr)}
          onSave={handleSaveHours}
          onDelete={handleDeleteHours}
          onToggleHoliday={handleToggleHoliday}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
