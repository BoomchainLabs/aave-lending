# DeFi Lending Platform

A comprehensive, production-ready decentralized finance (DeFi) platform built with Next.js 16, TypeScript, and Web3 integration. This application enables users to lend, borrow, manage portfolios, and execute flash loans on the Aave protocol across Ethereum mainnet.

## Features

### Core Functionality
- **Lending & Borrowing** - Deposit assets to earn yields or borrow against collateral
- **Portfolio Tracking** - Real-time monitoring of deposits, borrows, and health factor
- **Flash Loans** - Execute flash loans with premium fee calculations and liquidity checks
- **Reserve Analytics** - Detailed protocol-level data including TVL, rates, and asset composition
- **Wallet Integration** - Native MetaMask and Web3 wallet support with Ethereum mainnet connectivity

### Technical Features
- **Real-Time Data** - Live contract calls to Aave V3 Pool for current rates and liquidity
- **Redis Caching** - Upstash Redis integration for performance optimization and rate limiting
- **Error Handling** - Comprehensive error management with custom error types and user feedback
- **Toast Notifications** - Real-time user feedback with Sonner toast notifications
- **Dark/Light Theme** - Beautiful DeFi-focused UI with customizable theme support
- **Type Safety** - Full TypeScript implementation with proper type definitions
- **Responsive Design** - Mobile-first design that works across all screen sizes

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with semantic design tokens
- **Recharts** - Data visualization for analytics and charts
- **Shadcn/ui** - High-quality UI component library
- **Lucide Icons** - Beautiful, consistent icons

### Backend & Data
- **Node.js** - Runtime environment
- **Ethers.js v6** - Web3 library for contract interaction
- **Upstash Redis** - Serverless Redis for caching
- **Next.js API Routes** - Serverless function endpoints

### Blockchain
- **Aave V3 Protocol** - Lending protocol integration
- **Ethereum Mainnet** - Primary blockchain network
- **Smart Contracts** - Direct interaction with Aave Pool contract

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager
- MetaMask or compatible Web3 wallet
- Git for version control

## Installation

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/defi-lending-platform.git
cd defi-lending-platform
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Ethereum RPC Provider (choose one)
# Option 1: Infura
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key

# Option 2: Alchemy
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Option 3: QuickNode
NEXT_PUBLIC_QUICKNODE_RPC_URL=your_quicknode_rpc_url
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint URL | `https://xxxxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | `AY*` |
| `NEXT_PUBLIC_INFURA_API_KEY` | Infura API key for Ethereum RPC | `xxxxx` |

### Optional Variables

- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy provider key (alternative to Infura)
- `NEXT_PUBLIC_QUICKNODE_RPC_URL` - QuickNode RPC endpoint (alternative provider)

## Getting API Keys

### Upstash Redis
1. Visit [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the REST URL and token from the database details

### Infura
1. Visit [infura.io](https://infura.io)
2. Create a new project
3. Select Ethereum as the network
4. Copy your API key from project settings

### Alchemy (Alternative)
1. Visit [alchemy.com](https://alchemy.com)
2. Create an app on Ethereum mainnet
3. Copy the API key from app settings

## Usage

### Connecting Your Wallet
1. Click the "Connect Wallet" button in the navigation
2. Approve the connection in MetaMask
3. Ensure you're on Ethereum mainnet
4. Your address and balance will display in the header

### Depositing Assets
1. Navigate to the "Lending" tab
2. Select an asset from available tokens
3. Enter the amount to deposit
4. Click "Deposit [Asset]"
5. Approve the transaction in MetaMask
6. Monitor the transaction status via toast notifications

### Borrowing Assets
1. Go to the "Lending" tab
2. Select the "Borrow" tab
3. Choose an asset with available liquidity
4. Enter the borrow amount
5. Click "Borrow [Asset]"
6. Confirm the transaction
7. Track your debt in the Portfolio section

### Monitoring Portfolio
1. Click the "Portfolio" tab
2. View your collateral, debt, and health factor
3. Monitor real-time position changes
4. Health factor > 1.5 is considered healthy

### Executing Flash Loans
1. Navigate to the "Flash Loans" tab
2. Select an asset with available liquidity
3. Enter the desired loan amount
4. Review the premium fee (0.05%)
5. Click "Execute Flash Loan"
6. Complete the transaction within one block

### Viewing Analytics
1. Check the Dashboard for protocol-wide metrics
2. View TVL trends and reserve composition
3. Monitor APY rates across assets
4. Analyze liquidity and utilization rates

## API Routes

The application provides several API endpoints for data fetching and transaction execution:

### Data Endpoints

#### Get User Account Data
\`\`\`
GET /api/user/account?address=0x...
\`\`\`
Returns user's collateral, debt, available borrows, and health factor.

**Query Parameters:**
- `address` (required) - Ethereum address in 0x format

**Response:**
\`\`\`json
{
  "totalCollateral": "10500.25",
  "totalDebt": "3000.50",
  "availableBorrows": "7499.75",
  "ltv": 0.285,
  "healthFactor": "3.5"
}
\`\`\`

#### Get Reserve Data
\`\`\`
GET /api/reserves
\`\`\`
Returns data for all available lending reserves.

**Response:**
\`\`\`json
[
  {
    "asset": {
      "symbol": "USDC",
      "address": "0x...",
      "decimals": 6
    },
    "availableLiquidity": "50000000",
    "liquidityRate": 1.2e25,
    "variableBorrowRate": 2.5e25,
    "totalStableDebt": "1000000",
    "totalVariableDebt": "5000000"
  }
]
\`\`\`

#### Get Token Balance
\`\`\`
GET /api/balance?user=0x...&token=0x...
\`\`\`
Returns user's balance for a specific token.

**Query Parameters:**
- `user` (required) - User's Ethereum address
- `token` (required) - Token contract address

**Response:**
\`\`\`json
{
  "balance": "1000.50"
}
\`\`\`

### Transaction Endpoints

#### Deposit
\`\`\`
POST /api/transactions/deposit
\`\`\`
Prepares a deposit transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "1000"
}
\`\`\`

#### Withdraw
\`\`\`
POST /api/transactions/withdraw
\`\`\`
Prepares a withdrawal transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "500"
}
\`\`\`

#### Borrow
\`\`\`
POST /api/transactions/borrow
\`\`\`
Prepares a borrow transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "1000",
  "interestRateMode": 2
}
\`\`\`

#### Repay
\`\`\`
POST /api/transactions/repay
\`\`\`
Prepares a repayment transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "500"
}
\`\`\`

#### Flash Loan
\`\`\`
POST /api/transactions/flash-loan
\`\`\`
Prepares a flash loan transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "10000"
}
\`\`\`

#### Approve Token
\`\`\`
POST /api/transactions/approve
\`\`\`
Prepares an ERC20 token approval transaction.

**Request Body:**
\`\`\`json
{
  "userAddress": "0x...",
  "tokenAddress": "0x...",
  "amount": "1000"
}
\`\`\`

## Architecture

### Directory Structure
\`\`\`
defi-lending-platform/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── balance/
│   │   ├── reserves/
│   │   ├── user/
│   │   └── transactions/
│   ├── layout.tsx             # Root layout with theme provider
│   ├── page.tsx               # Main application page
│   └── globals.css            # Global styles and design tokens
├── components/
│   ├── dashboard.tsx          # Dashboard with analytics
│   ├── lending.tsx            # Lending/borrowing interface
│   ├── portfolio.tsx          # Portfolio tracker
│   ├── flash-loan.tsx         # Flash loan tool
│   ├── navigation.tsx         # Tab navigation
│   ├── analytics.tsx          # Analytics charts
│   ├── theme-provider.tsx     # Theme context provider
│   └── ui/                    # Shadcn UI components
├── lib/
│   ├── web3.ts                # Web3 utility functions
│   ├── contracts.ts           # Contract addresses and ABIs
│   ├── transactions.ts        # Transaction execution logic
│   ├── cache.ts               # Redis caching utilities
│   ├── errors.ts              # Custom error types
│   ├── logger.ts              # Logging utilities
│   ├── api-error-handler.ts   # API error handling
│   └── abis/
│       └── aave-pool.ts       # Aave V3 contract ABIs
├── hooks/
│   ├── use-mobile.ts          # Mobile detection hook
│   ├── use-toast.ts           # Toast notification hook
│   ├── use-transaction-monitor.ts  # Transaction monitoring
│   └── use-notification.ts    # Notification management
├── public/                    # Static assets
└── package.json              # Dependencies
\`\`\`

### Data Flow

1. **User connects wallet** → MetaMask request → Address stored in component state
2. **User initiates action** → Form submission → API route called
3. **API validates input** → Checks address format, amount validity
4. **API calls contract** → Ethers.js reads from Aave smart contract
5. **Response cached** → Upstash Redis stores result with TTL
6. **Data returned to UI** → Components display real-time information
7. **User confirms transaction** → MetaMask sign request
8. **Transaction executed** → Smart contract interaction
9. **Notification sent** → Toast shows success/error status
10. **Cache invalidated** → Redis cache cleared for fresh data

### Caching Strategy

| Endpoint | TTL | Cache Key Pattern |
|----------|-----|------------------|
| User Account | 60s | `user:{address}:account` |
| Reserve Data | 30s | `reserve:{tokenAddress}:data` |
| Token Balance | 45s | `balance:{userAddress}:{tokenAddress}` |

## Error Handling

The platform includes comprehensive error handling with custom error types:

- **DeFiError** - Base error class for all DeFi operations
- **ValidationError** - Input validation failures
- **ContractError** - Smart contract interaction failures
- **TransactionError** - Transaction execution failures
- **CacheError** - Redis cache operation failures

All errors are logged with context and returned to users via toast notifications.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy with a single click
6. Update DNS to point to your Vercel domain (optional)

### Deploy to Self-Hosted Server

\`\`\`bash
# Build for production
npm run build

# Start production server
npm run start
\`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
\`\`\`

## Performance Optimization

- **Redis Caching** - Reduces RPC calls and improves response times
- **Code Splitting** - Automatic with Next.js App Router
- **Image Optimization** - Optimized images with Next.js Image component
- **CSS Optimization** - Tailwind CSS purging unused styles
- **API Rate Limiting** - Implement rate limiting on production
- **Database Indexing** - Cache keys optimized for quick lookups

## Security Considerations

- **Never expose private keys** - Always use MetaMask for signing
- **Validate all inputs** - Address format, amount validity, token existence
- **Use HTTPS only** - Deploy with SSL/TLS certificates
- **Environment variables** - Keep sensitive data in .env files
- **Contract verification** - Verify all contract addresses on block explorers
- **Slippage protection** - Implement limits for large transactions
- **Audits** - Consider third-party security audits for production

## Monitoring & Logging

- All API requests logged with context
- Transaction monitoring with status tracking
- Error logging with stack traces
- Redis connection health checks
- Real-time toast notifications for user actions

## Troubleshooting

### Common Issues

**Problem: "MetaMask is not installed"**
- Solution: Install MetaMask browser extension from [metamask.io](https://metamask.io)

**Problem: "Invalid Ethereum address"**
- Solution: Ensure address is in 0x format with 40 hex characters (42 total)

**Problem: "Network mismatch"**
- Solution: Switch MetaMask to Ethereum mainnet (chainId: 1)

**Problem: "Insufficient allowance"**
- Solution: Approve token spending in Lending tab before deposit

**Problem: "Health factor too low"**
- Solution: Repay some debt or deposit more collateral to increase health factor

**Problem: "Redis connection error"**
- Solution: Verify UPSTASH_REDIS_REST_URL and token are correct in .env

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add comments for complex logic
- Test all new features
- Update README if adding new features
- Keep components focused and reusable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is a decentralized finance application that interacts with smart contracts on the Ethereum blockchain. Use at your own risk. The developers are not responsible for:
- Loss of funds due to smart contract vulnerabilities
- Network or wallet issues
- User error or transaction failures
- Changes to the Aave protocol

Always verify contract addresses on official sources before interacting.

## Support

For issues, questions, or suggestions:
- Open an GitHub issue
- Check existing documentation
- Review the troubleshooting section
- Check Aave protocol documentation

## Resources

- [Aave Protocol Docs](https://docs.aave.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Next.js 16 Guide](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)

---

**Built with ❤️ for the DeFi community**
