'use client';

import { useState, useRef } from 'react';
import { exportData, importData } from '../lib/storage';

export default function Settings({ settings, onSave, onClose }) {
  const [hoursPerDay, setHoursPerDay] = useState(String(settings.hoursPerDay));
  const [includeWeekends, setIncludeWeekends] = useState(settings.includeWeekends);
  const [holidays, setHolidays] = useState(settings.holidays.join('\n'));
  const [error, setError] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    const hpd = Number(hoursPerDay);
    if (isNaN(hpd) || hpd <= 0 || hpd > 24) {
      setError('Hours per day must be between 0.1 and 24.');
      return;
    }

    // Parse holidays: one per line, YYYY-MM-DD format
    const holidayList = holidays
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const h of holidayList) {
      if (!dateRegex.test(h)) {
        setError(`Invalid holiday date format: "${h}". Use YYYY-MM-DD.`);
        return;
      }
    }

    onSave({
      hoursPerDay: hpd,
      includeWeekends,
      holidays: holidayList,
    });
    onClose();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-hours-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setImportStatus('Error exporting data: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importData(event.target.result);
        setImportStatus('Data imported successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        setImportStatus('Error: Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-group">
            <label htmlFor="hours-per-day" className="modal-label">
              Expected hours per working day
            </label>
            <input
              id="hours-per-day"
              type="number"
              min="0.1"
              max="24"
              step="0.1"
              value={hoursPerDay}
              onChange={(e) => {
                setHoursPerDay(e.target.value);
                setError('');
              }}
              className="modal-input"
            />
            <p className="settings-hint">
              Default: 7.8 (= 39 hours / 5 days)
            </p>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeWeekends}
                onChange={(e) => setIncludeWeekends(e.target.checked)}
              />
              <span>Count weekends as working days</span>
            </label>
          </div>

          <div className="settings-group">
            <label htmlFor="holidays" className="modal-label">
              Public holidays (one per line, YYYY-MM-DD)
            </label>
            <textarea
              id="holidays"
              value={holidays}
              onChange={(e) => {
                setHolidays(e.target.value);
                setError('');
              }}
              className="modal-textarea"
              placeholder="2026-12-25&#10;2026-12-26&#10;2027-01-01"
              rows={4}
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <hr className="settings-divider" />

          <div className="settings-group">
            <p className="modal-label">Data Backup</p>
            <div className="settings-backup-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </div>
            {importStatus && <p className="settings-hint">{importStatus}</p>}
            <p className="settings-hint">
              Data is stored in your Neon PostgreSQL database. Export to create a local backup.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <div className="modal-actions-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
