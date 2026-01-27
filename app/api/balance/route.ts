import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalance } from '@/lib/web3';
import { getBalanceCache, setBalanceCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const userAddress = request.nextUrl.searchParams.get('user');
  const tokenAddress = request.nextUrl.searchParams.get('token');

  if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return NextResponse.json(
      { error: 'Invalid user address' },
      { status: 400 }
    );
  }

  if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    return NextResponse.json(
      { error: 'Invalid token address' },
      { status: 400 }
    );
  }

  try {
    // Try cache first
    let balance = await getBalanceCache(userAddress, tokenAddress);

    if (!balance) {
      // Fetch fresh balance
      balance = await getTokenBalance(userAddress, tokenAddress);
      // Cache it
      await setBalanceCache(userAddress, tokenAddress, balance);
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
