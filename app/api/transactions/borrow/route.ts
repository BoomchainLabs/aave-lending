import { NextRequest, NextResponse } from 'next/server';
import { executeBorrow } from '@/lib/transactions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, tokenAddress, amount, interestRateMode } = body;

    if (!userAddress || !tokenAddress || !amount || !interestRateMode) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, tokenAddress, amount, interestRateMode' },
        { status: 400 }
      );
    }

    if (![1, 2].includes(interestRateMode)) {
      return NextResponse.json(
        { error: 'Invalid interest rate mode. Must be 1 (stable) or 2 (variable)' },
        { status: 400 }
      );
    }

    const result = await executeBorrow(userAddress, tokenAddress, amount, interestRateMode);

    return NextResponse.json({
      success: true,
      transactionHash: result.hash,
      from: result.from,
      to: result.to,
      data: result.data,
      message: 'Borrow transaction prepared. Sign with your wallet to execute.',
    });
  } catch (error: any) {
    console.error('[v0] Borrow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare borrow' },
      { status: 500 }
    );
  }
}
