import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { loadPortfolio } from '@/lib/server/portfolio';

export const dynamic = 'force-dynamic';

/** Public, read-only snapshot of the whole portfolio. Never seeds or writes. */
export async function GET() {
  try {
    const data = await loadPortfolio();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleRouteError(error, 'load portfolio');
  }
}
