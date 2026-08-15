/**
 * API client for the job hours tracker.
 * Replaces the previous localStorage approach with server-side Neon PostgreSQL.
 * All functions are async since they make network requests.
 */

const DEFAULT_SETTINGS = {
  hoursPerDay: 7.8,
  includeWeekends: false,
  holidays: [],
};

// --- Database Initialization ---

export async function initDB() {
  const res = await fetch('/api/init', { method: 'POST' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to initialize database');
  }
  return res.json();
}

// --- Entries ---

/**
 * Get all entries for a specific month.
 * @param {number} year
 * @param {number} month - 0-indexed (0=January)
 * @returns {Object} - { "2026-08-01": 8, "2026-08-02": 7.5, ... }
 */
export async function getEntriesForMonth(year, month) {
  const res = await fetch(`/api/entries?year=${year}&month=${month + 1}`);
  if (!res.ok) {
    console.error('Failed to fetch entries');
    return {};
  }
  return res.json();
}

/**
 * Save (upsert) hours for a specific date.
 */
export async function saveEntry(dateStr, hours) {
  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: dateStr, hours }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save entry');
  }
  return res.json();
}

/**
 * Delete the entry for a specific date.
 */
export async function deleteEntry(dateStr) {
  const res = await fetch('/api/entries', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: dateStr }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete entry');
  }
  return res.json();
}

// --- Settings ---

export async function getSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return { ...DEFAULT_SETTINGS };
    const data = await res.json();
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save settings');
  }
  return res.json();
}

// --- Export / Import ---

export async function exportData() {
  const res = await fetch('/api/export');
  if (!res.ok) throw new Error('Failed to export data');
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonString) {
  const data = JSON.parse(jsonString);
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || 'Failed to import data');
  }
  return res.json();
}
