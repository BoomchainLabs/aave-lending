import { ethers } from 'ethers';

const AAVE_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const AAVE_POOL_ABI = [
  'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to)',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf)',
  'function flashLoan(address token, uint256 amount, bytes calldata params)',
  'function getReserveData(address asset)',
  'function getUserAccountData(address user)',
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts[0];
}

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export function getPoolContract(signer: ethers.Signer) {
  return new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
}

export async function getUserAccountData(address: string) {
  const provider = await getProvider();
  const contract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);
  try {
    const data = await contract.getUserAccountData(address);
    return {
      totalCollateral: ethers.formatEther(data[0]),
      totalDebt: ethers.formatEther(data[1]),
      availableBorrows: ethers.formatEther(data[2]),
      currentLiquidationThreshold: data[3],
      ltv: data[4],
      healthFactor: ethers.formatEther(data[5]),
    };
  } catch (error) {
    console.error('Error fetching user account data:', error);
    throw error;
  }
}
