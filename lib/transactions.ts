import { ethers } from 'ethers';

export interface TransactionParams {
  assetAddress: string;
  amount: string;
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw';
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

const AAVE_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const AAVE_POOL_ABI = [
  'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to)',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf)',
  'function flashLoan(address token, uint256 amount, bytes calldata params)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

export async function executeDeposit(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string
): Promise<TransactionResult> {
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  const userAddress = await signer.getAddress();

  // First approve the token
  const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
  const amountToApprove = ethers.parseEther(amount);

  const approveTx = await tokenContract.approve(AAVE_POOL_ADDRESS, amountToApprove);
  await approveTx.wait();

  // Execute deposit
  const tx = await poolContract.deposit(assetAddress, amountToApprove, userAddress, 0);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    from: userAddress,
    to: AAVE_POOL_ADDRESS,
    value: amount,
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
    timestamp: Date.now(),
  };
}

export async function executeBorrow(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string
): Promise<TransactionResult> {
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  const userAddress = await signer.getAddress();
  const amountToBorrow = ethers.parseEther(amount);

  const tx = await poolContract.borrow(assetAddress, amountToBorrow, 2, 0, userAddress);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    from: userAddress,
    to: AAVE_POOL_ADDRESS,
    value: amount,
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
    timestamp: Date.now(),
  };
}

export async function executeRepay(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string
): Promise<TransactionResult> {
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  const userAddress = await signer.getAddress();

  // First approve the token
  const tokenContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
  const amountToRepay = ethers.parseEther(amount);

  const approveTx = await tokenContract.approve(AAVE_POOL_ADDRESS, amountToRepay);
  await approveTx.wait();

  // Execute repay
  const tx = await poolContract.repay(assetAddress, amountToRepay, 2, userAddress);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    from: userAddress,
    to: AAVE_POOL_ADDRESS,
    value: amount,
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
    timestamp: Date.now(),
  };
}

export async function executeWithdraw(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string
): Promise<TransactionResult> {
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  const userAddress = await signer.getAddress();
  const amountToWithdraw = ethers.parseEther(amount);

  const tx = await poolContract.withdraw(assetAddress, amountToWithdraw, userAddress);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    from: userAddress,
    to: AAVE_POOL_ADDRESS,
    value: amount,
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
    timestamp: Date.now(),
  };
}

export async function executeFlashLoan(
  signer: ethers.Signer,
  assetAddress: string,
  amount: string,
  receiverAddress: string
): Promise<TransactionResult> {
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  const userAddress = await signer.getAddress();
  const amountToFlash = ethers.parseEther(amount);

  // Encode the flash loan parameters
  const params = ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'uint256'],
    [userAddress, amountToFlash]
  );

  const tx = await poolContract.flashLoan(assetAddress, amountToFlash, receiverAddress, params);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    from: userAddress,
    to: AAVE_POOL_ADDRESS,
    value: amount,
    status: receipt?.status === 1 ? 'confirmed' : 'failed',
    timestamp: Date.now(),
  };
}

export async function getTokenBalance(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string
): Promise<string> {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await tokenContract.balanceOf(userAddress);
  return ethers.formatEther(balance);
}

export async function checkAllowance(
  provider: ethers.Provider,
  tokenAddress: string,
  owner: string,
  spender: string
): Promise<string> {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await tokenContract.allowance(owner, spender);
  return ethers.formatEther(allowance);
}
