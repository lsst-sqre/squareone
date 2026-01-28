import { mockBroadcasts } from '@lsst-sqre/semaphore-client';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(mockBroadcasts);
}

// Alternative mock data for testing scenarios:
// Empty broadcasts:
//   return NextResponse.json([]);
//
// Filter to outage-only:
//   return NextResponse.json(
//     mockBroadcasts.filter((b) => b.category === 'outage')
//   );
