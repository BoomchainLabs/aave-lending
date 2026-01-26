import { NextResponse } from 'next/server';
import { getReserveData } from '@/lib/web3';
import { TOKENS } from '@/lib/contracts';

export async function GET() {
  try {
    const tokenAddresses = Object.values(TOKENS).map(t => t.address);
    
    const reserves = await Promise.all(
      tokenAddresses.map(async (address) => {
        const token = Object.values(TOKENS).find(t => t.address === address);
        try {
          const data = await getReserveData(address);
          return {
            asset: token,
            ...data,
          };
        } catch (error) {
          console.error(`[v0] Error fetching reserve data for ${address}:`, error);
          return null;
        }
      })
    );

    const validReserves = reserves.filter((r) => r !== null);
    return NextResponse.json(validReserves);
  } catch (error) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reserves' },
      { status: 500 }
    );
  }
}
