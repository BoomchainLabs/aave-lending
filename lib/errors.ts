export class DeFiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DeFiError';
  }
}

export class NetworkError extends DeFiError {
  constructor(message: string) {
    super('NETWORK_ERROR', message, 503);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends DeFiError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class ContractError extends DeFiError {
  constructor(message: string, public originalError?: Error) {
    super('CONTRACT_ERROR', message, 500);
    this.name = 'ContractError';
  }
}

export class InsufficientFundsError extends DeFiError {
  constructor(message: string = 'Insufficient funds') {
    super('INSUFFICIENT_FUNDS', message, 400);
    this.name = 'InsufficientFundsError';
  }
}

export class InsufficientLiquidityError extends DeFiError {
  constructor(message: string = 'Insufficient liquidity') {
    super('INSUFFICIENT_LIQUIDITY', message, 400);
    this.name = 'InsufficientLiquidityError';
  }
}

export class HealthFactorError extends DeFiError {
  constructor(message: string = 'Health factor too low') {
    super('HEALTH_FACTOR_ERROR', message, 400);
    this.name = 'HealthFactorError';
  }
}

export function handleContractError(error: any): never {
  const message = error?.message || 'Unknown contract error';

  if (message.includes('insufficient balance')) {
    throw new InsufficientFundsError();
  }

  if (message.includes('insufficient liquidity')) {
    throw new InsufficientLiquidityError();
  }

  if (message.includes('health factor')) {
    throw new HealthFactorError();
  }

  if (message.includes('network') || message.includes('timeout')) {
    throw new NetworkError(`Network error: ${message}`);
  }

  throw new ContractError(`Contract error: ${message}`, error);
}

export function getErrorMessage(error: any): string {
  if (error instanceof DeFiError) {
    return error.message;
  }

  if (error?.reason) {
    return error.reason;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
