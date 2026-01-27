import { NextResponse } from 'next/server';
import { DeFiError, getErrorMessage } from './errors';
import { logger } from './logger';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
}

export function handleApiError(error: any, context?: string): NextResponse<ErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof DeFiError) {
    logger.warn(`DeFi Error: ${error.code}`, {
      message: error.message,
      context,
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp,
      },
      { status: error.statusCode }
    );
  }

  // Handle ethers.js specific errors
  if (error?.reason) {
    logger.error('Contract interaction error', error, {
      reason: error.reason,
      context,
    });

    return NextResponse.json(
      {
        error: error.reason,
        details: error.message,
        timestamp,
      },
      { status: 500 }
    );
  }

  // Handle validation errors
  if (error?.name === 'ValidationError') {
    logger.warn('Validation error', { message: error.message, context });

    return NextResponse.json(
      {
        error: error.message,
        code: 'VALIDATION_ERROR',
        timestamp,
      },
      { status: 400 }
    );
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    logger.error('Network error', error, { context });

    return NextResponse.json(
      {
        error: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
        timestamp,
      },
      { status: 503 }
    );
  }

  // Generic error handling
  const message = getErrorMessage(error);
  logger.error('Unexpected error', error, { message, context });

  return NextResponse.json(
    {
      error: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
      timestamp,
    },
    { status: 500 }
  );
}
