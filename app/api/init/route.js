import { initDatabase } from '../../lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/init — Initialize the database schema.
 * Safe to call multiple times.
 */
export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized.' });
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
