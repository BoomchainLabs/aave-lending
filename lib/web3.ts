import { ethers } from 'ethers';
import { AAVE_POOL_ABI, DATA_PROVIDER_ABI, ERC20_ABI } from './abis/aave-pool';
import { CONTRACTS, TOKENS, RPC_URL } from './contracts';

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    // Request network switch to Ethereum mainnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error('Please switch to Ethereum Mainnet');
    }
    throw error;
  }
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

export function getPoolContract(signer: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACTS.POOL, AAVE_POOL_ABI, signer);
}

export function getDataProviderContract(provider: ethers.Provider) {
  return new ethers.Contract(CONTRACTS.DATA_PROVIDER, DATA_PROVIDER_ABI, provider);
}

export function getTokenContract(tokenAddress: string, signer?: ethers.Signer | ethers.Provider) {
  const signerOrProvider = signer || getPublicProvider();
  return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
}

export function getPublicProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getUserAccountData(address: string) {
  const provider = getPublicProvider();
  const contract = getPoolContract(provider);
  
  try {
    const [totalCollateral, totalDebt, availableBorrows, liquidationThreshold, ltv, healthFactor] = 
      await contract.getUserAccountData(address);
    
    return {
      totalCollateral: ethers.formatUnits(totalCollateral, 8),
      totalDebt: ethers.formatUnits(totalDebt, 8),
      availableBorrows: ethers.formatUnits(availableBorrows, 8),
      currentLiquidationThreshold: Number(liquidationThreshold) / 10000,
      ltv: Number(ltv) / 10000,
      healthFactor: Number(healthFactor) === 0 ? '0' : ethers.formatEther(healthFactor),
    };
  } catch (error) {
    console.error('[v0] Error fetching user account data:', error);
    throw error;
  }
}

export async function getReserveData(assetAddress: string) {
  const provider = getPublicProvider();
  const dataProvider = getDataProviderContract(provider);
  
  try {
    const [
      availableLiquidity,
      totalStableDebt,
      totalVariableDebt,
      liquidityRate,
      variableBorrowRate,
      stableBorrowRate,
      liquidityIndex,
      variableBorrowIndex,
      lastUpdateTimestamp,
    ] = await dataProvider.getReserveData(assetAddress);

    return {
      availableLiquidity: ethers.formatUnits(availableLiquidity, 18),
      totalStableDebt: ethers.formatUnits(totalStableDebt, 18),
      totalVariableDebt: ethers.formatUnits(totalVariableDebt, 18),
      liquidityRate: Number(liquidityRate),
      variableBorrowRate: Number(variableBorrowRate),
      stableBorrowRate: Number(stableBorrowRate),
      liquidityIndex: ethers.formatEther(liquidityIndex),
      variableBorrowIndex: ethers.formatEther(variableBorrowIndex),
      lastUpdateTimestamp: Number(lastUpdateTimestamp),
    };
  } catch (error) {
    console.error('[v0] Error fetching reserve data:', error);
    throw error;
  }
}

export async function getTokenBalance(userAddress: string, tokenAddress: string) {
  const provider = getPublicProvider();
  const token = getTokenContract(tokenAddress, provider);
  
  try {
    const decimals = await token.decimals();
    const balance = await token.balanceOf(userAddress);
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('[v0] Error fetching token balance:', error);
    throw error;
  }
}

export async function getTokenAllowance(userAddress: string, tokenAddress: string, spenderAddress: string) {
  const provider = getPublicProvider();
  const token = getTokenContract(tokenAddress, provider);
  
  try {
    const decimals = await token.decimals();
    const allowance = await token.allowance(userAddress, spenderAddress);
    return ethers.formatUnits(allowance, decimals);
  } catch (error) {
    console.error('[v0] Error fetching token allowance:', error);
    throw error;
  }
}
