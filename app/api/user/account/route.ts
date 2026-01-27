import { NextRequest } from 'next/server';
import { getUserAccountData } from '@/lib/web3';
import { getUserDataCache, setUserDataCache } from '@/lib/cache';
import { handleApiError } from '@/lib/api-error-handler';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  try {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new ValidationError('Invalid Ethereum address format');
    }

    logger.debug('Fetching user account data', { address });

    // Try to get from cache first
    const cached = await getUserDataCache(address);
    if (cached) {
      logger.info('User data cache hit', { address });
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch fresh data
    const data = await getUserAccountData(address);

    // Cache the result
    await setUserDataCache(address, data);

    logger.info('User account data fetched successfully', { address });

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/user/account');
  }
}
