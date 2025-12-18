import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(mockDiscovery);
}
