import { getSQL } from '../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/entries?year=2026&month=8
 * Returns all entries for a given month.
 * Month is 1-indexed (1=January, 12=December).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year'));
    const month = parseInt(searchParams.get('month'));

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Valid year and month (1-12) are required.' },
        { status: 400 }
      );
    }

    const sql = getSQL();

    // Query entries for the given month using date range
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const rows = await sql`
      SELECT to_char(date, 'YYYY-MM-DD') as date_str, hours
      FROM work_entries
      WHERE date >= ${startDate}::date AND date < ${endDate}::date
      ORDER BY date
    `;

    // Convert to { "YYYY-MM-DD": hours } map
    const entries = {};
    for (const row of rows) {
      entries[row.date_str] = parseFloat(row.hours);
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/entries
 * Body: { date: "YYYY-MM-DD", hours: 7.5 }
 * Upserts an entry — creates or updates if the date already exists.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, hours } = body;

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'A valid date in YYYY-MM-DD format is required.' },
        { status: 400 }
      );
    }

    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours < 0 || numHours > 24) {
      return NextResponse.json(
        { error: 'Hours must be a number between 0 and 24.' },
        { status: 400 }
      );
    }

    const sql = getSQL();

    await sql`
      INSERT INTO work_entries (date, hours, updated_at)
      VALUES (${date}::date, ${numHours}, NOW())
      ON CONFLICT (date)
      DO UPDATE SET hours = ${numHours}, updated_at = NOW()
    `;

    return NextResponse.json({ success: true, date, hours: numHours });
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/entries
 * Body: { date: "YYYY-MM-DD" }
 * Deletes the entry for the given date.
 */
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'A valid date in YYYY-MM-DD format is required.' },
        { status: 400 }
      );
    }

    const sql = getSQL();

    await sql`
      DELETE FROM work_entries WHERE date = ${date}::date
    `;

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('DELETE /api/entries error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
