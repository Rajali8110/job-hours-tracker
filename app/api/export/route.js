import { getSQL } from '../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/export
 * Exports all entries and settings as a JSON blob for backup.
 */
export async function GET() {
  try {
    const sql = getSQL();

    const entries = await sql`SELECT to_char(date, 'YYYY-MM-DD') as date_str, hours FROM work_entries ORDER BY date`;
    const settingsRows = await sql`SELECT data FROM app_settings WHERE id = 1`;

    const entriesMap = {};
    for (const row of entries) {
      entriesMap[row.date_str] = parseFloat(row.hours);
    }

    const settings = settingsRows.length > 0 ? settingsRows[0].data : {};

    return NextResponse.json({
      entries: entriesMap,
      settings,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/export  (import endpoint)
 * Body: { entries: { "YYYY-MM-DD": hours, ... }, settings: { ... } }
 * Imports entries and settings, merging with existing data.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const sql = getSQL();

    // Import entries
    if (body.entries && typeof body.entries === 'object') {
      for (const [date, hours] of Object.entries(body.entries)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof hours === 'number' && hours >= 0 && hours <= 24) {
          await sql`
            INSERT INTO work_entries (date, hours, updated_at)
            VALUES (${date}::date, ${hours}, NOW())
            ON CONFLICT (date)
            DO UPDATE SET hours = ${hours}, updated_at = NOW()
          `;
        }
      }
    }

    // Import settings
    if (body.settings && typeof body.settings === 'object') {
      const settings = body.settings;
      await sql`
        INSERT INTO app_settings (id, data, updated_at)
        VALUES (1, ${JSON.stringify(settings)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = ${JSON.stringify(settings)}::jsonb, updated_at = NOW()
      `;
    }

    return NextResponse.json({ success: true, message: 'Data imported successfully.' });
  } catch (error) {
    console.error('POST /api/export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
