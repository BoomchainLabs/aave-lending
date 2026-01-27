// Aave Ethereum Mainnet Addresses
export const CONTRACTS = {
  // Aave V3 Pool
  POOL: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
  // Aave Data Provider
  DATA_PROVIDER: '0x7F02474b033Cc3EC2C78f7Ec5A1EE9d9e9E2FC66',
  // Aave Incentives Controller
  INCENTIVES_CONTROLLER: '0xd784927Ff2f95ba288F688d67fcA888e5b6751e75',
};

// Common tokens on Ethereum mainnet
export const TOKENS = {
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  WBTC: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDd86a3D015fC31',
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
  },
};

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
export const CHAIN_ID = 1; // Ethereum mainnet
