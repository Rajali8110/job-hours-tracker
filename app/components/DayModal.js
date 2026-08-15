'use client';

import { useState, useEffect, useRef } from 'react';
import { getMonthName } from '../lib/dateUtils';

export default function DayModal({ dateStr, day, month, year, currentHours, isHoliday, onSave, onDelete, onToggleHoliday, onClose }) {
  const [hours, setHours] = useState(currentHours !== null ? String(currentHours) : '');
  const [holidayChecked, setHolidayChecked] = useState(isHoliday || false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when the modal opens
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const validate = (value) => {
    if (value === '') return { valid: true, hours: null };
    const num = Number(value);
    if (isNaN(num)) return { valid: false, error: 'Please enter a valid number.' };
    if (num < 0) return { valid: false, error: 'Hours cannot be negative.' };
    if (num > 24) return { valid: false, error: 'Hours cannot exceed 24.' };
    return { valid: true, hours: num };
  };

  const handleSave = () => {
    // Save the holiday toggle state if it changed
    if (holidayChecked !== isHoliday) {
      onToggleHoliday(dateStr, holidayChecked);
    }

    const result = validate(hours);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    if (result.hours === null || result.hours === 0) {
      // If empty or zero, delete the entry
      onDelete(dateStr);
    } else {
      onSave(dateStr, result.hours);
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(dateStr);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {getMonthName(month)} {day}, {year}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label htmlFor="hours-input" className="modal-label">
            Hours worked
          </label>
          <input
            ref={inputRef}
            id="hours-input"
            type="number"
            min="0"
            max="24"
            step="0.25"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            className="modal-input"
            placeholder="e.g. 7.8"
          />
          {error && <p className="modal-error">{error}</p>}
          
          <label className="modal-checkbox-label" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={holidayChecked} 
              onChange={(e) => setHolidayChecked(e.target.checked)} 
              style={{ width: '16px', height: '16px' }}
            />
            Mark as non-working day (Sick / Vacation / Holiday)
          </label>
        </div>

        <div className="modal-actions">
          {currentHours !== null && (
            <button className="btn btn-danger" onClick={handleDelete}>
              Remove
            </button>
          )}
          <div className="modal-actions-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
