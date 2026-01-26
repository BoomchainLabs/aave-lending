import { NextRequest, NextResponse } from 'next/server';
import { getUserAccountData } from '@/lib/web3';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address' },
      { status: 400 }
    );
  }

  try {
    const data = await getUserAccountData(address);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user account data' },
      { status: 500 }
    );
  }
}
