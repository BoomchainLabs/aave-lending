import { NextRequest, NextResponse } from 'next/server';
import { executeApprove } from '@/lib/transactions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, tokenAddress, amount } = body;

    if (!userAddress || !tokenAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, tokenAddress, amount' },
        { status: 400 }
      );
    }

    const result = await executeApprove(userAddress, tokenAddress, amount);

    return NextResponse.json({
      success: true,
      transactionHash: result.hash,
      from: result.from,
      to: result.to,
      data: result.data,
      message: 'Approval transaction prepared. Sign with your wallet to execute.',
    });
  } catch (error: any) {
    console.error('[v0] Approve error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare approval' },
      { status: 500 }
    );
  }
}
