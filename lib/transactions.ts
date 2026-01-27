import { ethers } from 'ethers';
import { AAVE_POOL_ABI, ERC20_ABI } from './abis/aave-pool';
import { CONTRACTS } from './contracts';

export interface TransactionParams {
  assetAddress: string;
  amount: string;
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw' | 'flashLoan';
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
}

export class TransactionError extends Error {
  constructor(
    public code: string,
    message: string,
    public original?: Error
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

/**
 * Approve token spending for the Aave Pool
 */
export async function approveToken(
  signer: ethers.Signer,
  tokenAddress: string,
  amount: string,
  decimals: number = 18
): Promise<ethers.ContractTransactionResponse | null> {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const amountToApprove = ethers.parseUnits(amount, decimals);

  try {
    const currentAllowance = await tokenContract.allowance(
      await signer.getAddress(),
      CONTRACTS.POOL
    );

    // Only approve if needed
    if (BigInt(currentAllowance) < amountToApprove) {
      const approveTx = await tokenContract.approve(CONTRACTS.POOL, amountToApprove);
      await approveTx.wait();
      return approveTx;
    }

    return null;
  } catch (error) {
    throw new TransactionError(
      'APPROVE_ERROR',
      'Failed to approve token spending',
      error as Error
    );
  }
}

/**
 * Execute approval transaction (returns transaction data for client signing)
 */
export async function executeApprove(
  userAddress: string,
  tokenAddress: string,
  amount: string,
  decimals: number = 18
): Promise<{
  hash: string;
  from: string;
  to: string;
  data: string;
  value: string;
}> {
  try {
    // Create token contract interface for building transaction data
    const tokenInterface = new ethers.Interface(ERC20_ABI);
    const amountToApprove = ethers.parseUnits(amount, decimals);

    // Encode the approve function call
    const data = tokenInterface.encodeFunctionData('approve', [
      CONTRACTS.POOL,
      amountToApprove,
    ]);

    return {
      hash: '', // Hash will be set after signing
      from: userAddress,
      to: tokenAddress,
      data: data,
      value: '0',
    };
  } catch (error) {
    throw new TransactionError(
      'APPROVE_PREP_ERROR',
      'Failed to prepare approval transaction',
      error as Error
    );
  }
}

/**
 * Execute deposit on Aave Pool
 */
export async function executeDeposit(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string,
  decimals: number = 18
): Promise<TransactionResult> {
  const userAddress = await signer.getAddress();
  const poolContract = new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);

  try {
    // Approve token first
    await approveToken(signer, assetAddress, amount, decimals);

    const amountToDeposit = ethers.parseUnits(amount, decimals);

    // Execute deposit
    const tx = await poolContract.supply(assetAddress, amountToDeposit, userAddress, 0);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new TransactionError('RECEIPT_ERROR', 'Transaction receipt not found');
    }

    return {
      hash: tx.hash,
      from: userAddress,
      to: CONTRACTS.POOL,
      value: amount,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if (error instanceof TransactionError) throw error;
    throw new TransactionError(
      'DEPOSIT_ERROR',
      'Failed to execute deposit',
      error as Error
    );
  }
}

/**
 * Execute borrow on Aave Pool
 */
export async function executeBorrow(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string,
  decimals: number = 18,
  interestRateMode: number = 2 // 2 for variable rate
): Promise<TransactionResult> {
  const userAddress = await signer.getAddress();
  const poolContract = new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);

  try {
    const amountToBorrow = ethers.parseUnits(amount, decimals);

    const tx = await poolContract.borrow(
      assetAddress,
      amountToBorrow,
      interestRateMode,
      0,
      userAddress
    );
    const receipt = await tx.wait();

    if (!receipt) {
      throw new TransactionError('RECEIPT_ERROR', 'Transaction receipt not found');
    }

    return {
      hash: tx.hash,
      from: userAddress,
      to: CONTRACTS.POOL,
      value: amount,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if (error instanceof TransactionError) throw error;
    throw new TransactionError(
      'BORROW_ERROR',
      'Failed to execute borrow',
      error as Error
    );
  }
}

/**
 * Execute repay on Aave Pool
 */
export async function executeRepay(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string,
  decimals: number = 18,
  interestRateMode: number = 2
): Promise<TransactionResult> {
  const userAddress = await signer.getAddress();
  const poolContract = new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);

  try {
    // Approve token first
    await approveToken(signer, assetAddress, amount, decimals);

    const amountToRepay = ethers.parseUnits(amount, decimals);

    const tx = await poolContract.repay(
      assetAddress,
      amountToRepay,
      interestRateMode,
      userAddress
    );
    const receipt = await tx.wait();

    if (!receipt) {
      throw new TransactionError('RECEIPT_ERROR', 'Transaction receipt not found');
    }

    return {
      hash: tx.hash,
      from: userAddress,
      to: CONTRACTS.POOL,
      value: amount,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if (error instanceof TransactionError) throw error;
    throw new TransactionError(
      'REPAY_ERROR',
      'Failed to execute repay',
      error as Error
    );
  }
}

/**
 * Execute withdraw on Aave Pool
 */
export async function executeWithdraw(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string,
  decimals: number = 18
): Promise<TransactionResult> {
  const userAddress = await signer.getAddress();
  const poolContract = new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);

  try {
    const amountToWithdraw = ethers.parseUnits(amount, decimals);

    const tx = await poolContract.withdraw(assetAddress, amountToWithdraw, userAddress);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new TransactionError('RECEIPT_ERROR', 'Transaction receipt not found');
    }

    return {
      hash: tx.hash,
      from: userAddress,
      to: CONTRACTS.POOL,
      value: amount,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if (error instanceof TransactionError) throw error;
    throw new TransactionError(
      'WITHDRAW_ERROR',
      'Failed to execute withdraw',
      error as Error
    );
  }
}

/**
 * Execute flash loan on Aave Pool
 */
export async function executeFlashLoan(
  signer: ethers.Signer,
  tokenAddress: string,
  amount: string,
  decimals: number = 18,
  params: string = '0x'
): Promise<TransactionResult> {
  const userAddress = await signer.getAddress();
  const poolContract = new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);

  try {
    const amountToFlash = ethers.parseUnits(amount, decimals);

    const tx = await poolContract.flashLoan(
      userAddress,
      tokenAddress,
      amountToFlash,
      params
    );
    const receipt = await tx.wait();

    if (!receipt) {
      throw new TransactionError('RECEIPT_ERROR', 'Transaction receipt not found');
    }

    return {
      hash: tx.hash,
      from: userAddress,
      to: CONTRACTS.POOL,
      value: amount,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      timestamp: Date.now(),
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    if (error instanceof TransactionError) throw error;
    throw new TransactionError(
      'FLASHLOAN_ERROR',
      'Failed to execute flash loan',
      error as Error
    );
  }
}
