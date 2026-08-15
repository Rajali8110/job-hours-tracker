'use client';

import { formatHours, formatHoursMinutes, formatPercent } from '../lib/dateUtils';

export default function Dashboard({ stats }) {
  const {
    monthName,
    year,
    targetHours,
    workedHours,
    remainingHours,
    workingDays,
    daysWithEntries,
    progressPercent,
    averageHours,
  } = stats;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">
        {monthName} {year}
      </h1>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <span className="progress-label">{formatPercent(progressPercent)}%</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{formatHoursMinutes(targetHours)}</span>
          <span className="stat-label">Target</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{formatHoursMinutes(workedHours)}</span>
          <span className="stat-label">Worked</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatHoursMinutes(remainingHours)}</span>
          <span className="stat-label">Remaining</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{workingDays}</span>
          <span className="stat-label">Working Days</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{daysWithEntries}</span>
          <span className="stat-label">Days Logged</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatHoursMinutes(averageHours)}</span>
          <span className="stat-label">Avg / Day</span>
        </div>
      </div>
    </div>
  );
}
