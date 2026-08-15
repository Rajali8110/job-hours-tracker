import { getSQL } from '../../lib/db';
import { NextResponse } from 'next/server';

const DEFAULT_SETTINGS = {
  hoursPerDay: 7.8,
  includeWeekends: false,
  holidays: [],
};

/**
 * GET /api/settings
 * Returns the current settings.
 */
export async function GET() {
  try {
    const sql = getSQL();

    const rows = await sql`
      SELECT data FROM app_settings WHERE id = 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({ ...DEFAULT_SETTINGS, ...rows[0].data });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/settings
 * Body: { hoursPerDay: 7.8, includeWeekends: false, holidays: [] }
 * Upserts the settings.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate
    if (body.hoursPerDay !== undefined) {
      const hpd = parseFloat(body.hoursPerDay);
      if (isNaN(hpd) || hpd <= 0 || hpd > 24) {
        return NextResponse.json(
          { error: 'hoursPerDay must be between 0.1 and 24.' },
          { status: 400 }
        );
      }
      body.hoursPerDay = hpd;
    }

    const settings = { ...DEFAULT_SETTINGS, ...body };
    const sql = getSQL();

    await sql`
      INSERT INTO app_settings (id, data, updated_at)
      VALUES (1, ${JSON.stringify(settings)}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = ${JSON.stringify(settings)}::jsonb, updated_at = NOW()
    `;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
