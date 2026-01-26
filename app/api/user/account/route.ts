import { NextRequest, NextResponse } from 'next/server';
import { getUserAccountData } from '@/lib/web3';
import { getUserDataCache, setUserDataCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address' },
      { status: 400 }
    );
  }

  try {
    // Try to get from cache first
    const cached = await getUserDataCache(address);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Fetch fresh data
    const data = await getUserAccountData(address);
    
    // Cache the result
    await setUserDataCache(address, data);

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user account data' },
      { status: 500 }
    );
  }
}
