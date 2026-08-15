'use client';

import {
  getDaysInMonth,
  getFirstDayOfWeek,
  getDayNames,
  toDateString,
  isWeekend,
  isToday,
  formatHours,
  formatHoursMinutes,
} from '../lib/dateUtils';

export default function Calendar({
  year,
  month,
  entries,
  holidays,
  includeWeekends,
  onDayClick,
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const dayNames = getDayNames();

  // Build grid cells
  const cells = [];
  // Empty cells for offset
  for (let i = 0; i < firstDay; i++) {
    cells.push({ empty: true, key: `empty-${i}` });
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toDateString(year, month, day);
    const hours = entries[dateStr] ?? null;
    const weekend = isWeekend(year, month, day);
    const holiday = holidays.includes(dateStr);
    const today = isToday(dateStr);
    const isNonWorking = (weekend && !includeWeekends) || holiday;

    cells.push({
      empty: false,
      key: dateStr,
      day,
      dateStr,
      hours,
      weekend,
      holiday,
      today,
      isNonWorking,
      hasEntry: hours !== null,
    });
  }

  // Group into weeks and calculate totals
  const weeks = [];
  let currentWeek = [];
  
  for (const cell of cells) {
    currentWeek.push(cell);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    // Pad the last week with empty cells
    while (currentWeek.length < 7) {
      currentWeek.push({ empty: true, key: `empty-end-${currentWeek.length}` });
    }
    weeks.push(currentWeek);
  }

  const gridCells = [];
  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w];
    let weekTotal = 0;
    for (const cell of week) {
      if (!cell.empty && cell.hours) {
        weekTotal += cell.hours;
      }
      gridCells.push(cell);
    }
    // Append the total cell
    gridCells.push({ 
      isTotal: true, 
      key: `total-w${w}`,
      total: Math.round(weekTotal * 100) / 100 
    });
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        {dayNames.map((name) => (
          <div key={name} className="calendar-day-name">
            {name}
          </div>
        ))}
        <div key="Total" className="calendar-day-name" style={{ color: 'var(--text-primary)' }}>
          Total
        </div>
      </div>
      <div className="calendar-grid">
        {gridCells.map((cell) => {
          if (cell.empty) {
            return <div key={cell.key} className="calendar-cell empty" />;
          }

          if (cell.isTotal) {
            return (
              <div key={cell.key} className="calendar-cell total">
                <span className="cell-day">Week</span>
                <span className="cell-hours">{formatHoursMinutes(cell.total)}</span>
              </div>
            );
          }

          const classNames = ['calendar-cell'];
          if (cell.hasEntry) classNames.push('has-entry');
          else if (cell.isNonWorking) classNames.push('non-working');
          if (cell.today) classNames.push('today');

          return (
            <div
              key={cell.key}
              className={classNames.join(' ')}
              onClick={() => onDayClick(cell.dateStr, cell.day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDayClick(cell.dateStr, cell.day);
                }
              }}
            >
              <span className="cell-day">{cell.day}</span>
              {cell.hasEntry && (
                <span className="cell-hours">{formatHours(cell.hours)}h</span>
              )}
              {cell.holiday && !cell.hasEntry && (
                <span className="cell-badge" title="Non-working day">🏖️</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
