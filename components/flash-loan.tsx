'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, Code2, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOKENS } from '@/lib/contracts';
import { useTransactionMonitor } from '@/hooks/use-transaction-monitor';

interface FlashLoanToolProps {
  account: string | null;
}

interface ReserveData {
  asset: any;
  availableLiquidity: string;
  liquidityRate: number;
}

const codeExamples = {
  arbitrage: `pragma solidity ^0.8.0;

interface IFlashLoanReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bytes32);
}

contract ArbitrageBot is IFlashLoanReceiver {
    address constant AAVE_POOL = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
    
    function doFlashLoan(address asset, uint256 amount) external {
        ILendingPool(AAVE_POOL).flashLoan(
            address(this),
            asset,
            amount,
            abi.encodeWithSignature("arbitrageLogic()")
        );
    }
    
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bytes32) {
        // Your arbitrage logic here
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(AAVE_POOL, amountOwed);
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}`,
  liquidation: `pragma solidity ^0.8.0;

contract LiquidationBot is IFlashLoanReceiver {
    function liquidateWithFlash(
        address borrower,
        address debtToken,
        uint256 debtAmount
    ) external {
        // Request flash loan for the debt amount
        ILendingPool(AAVE_POOL).flashLoan(
            address(this),
            debtToken,
            debtAmount,
            abi.encodeWithSignature("liquidate(address,address,uint256)",
                borrower, debtToken, debtAmount)
        );
    }
    
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bytes32) {
        // Execute liquidation with borrowed funds
        // Seize collateral and repay debt
        // Keep profit after premium payment
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}`,
};

const FLASH_LOAN_PREMIUM = 0.0005; // 0.05%

export default function FlashLoanTool({ account }: FlashLoanToolProps) {
  const [reserves, setReserves] = useState<ReserveData[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<'arbitrage' | 'liquidation'>('arbitrage');
  const { executeTransaction, status } = useTransactionMonitor();
  const [selectedAsset, setSelectedAsset] = useState<any>(null); // Declare selectedAsset
  const [premium, setPremium] = useState<number>(FLASH_LOAN_PREMIUM); // Declare premium

  useEffect(() => {
    fetchReserves();
    if (Object.keys(TOKENS).length > 0) {
      setSelectedToken(Object.keys(TOKENS)[0]);
    }
  }, []);

  const fetchReserves = async () => {
    try {
      const response = await fetch('/api/reserves');
      if (!response.ok) throw new Error('Failed to fetch reserves');
      const data = await response.json();
      setReserves(data);
      setError(null);
    } catch (err) {
      console.error('[v0] Error fetching reserves:', err);
      setError('Failed to load reserve data');
    }
  };

  const activeReserve = reserves.find(
    r => r.asset?.address?.toLowerCase() === TOKENS[selectedToken]?.address?.toLowerCase()
  );

  const availableLiquidity = activeReserve
    ? parseFloat(activeReserve.availableLiquidity)
    : 0;
  
  const premiumAmount = amount ? parseFloat(amount) * FLASH_LOAN_PREMIUM : 0;
  const totalRepay = amount ? parseFloat(amount) + premiumAmount : 0;

  const handleExecuteFlashLoan = async () => {
    if (!amount || !account || !selectedToken) {
      setError('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions/flash-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          tokenAddress: TOKENS[selectedToken]?.address || '',
          amount,
        }),
      });
      if (!response.ok) throw new Error('Flash loan execution failed');
      setAmount('');
      await executeTransaction();
      await fetchReserves();
    } catch (err: any) {
      setError(err.message || 'Flash loan execution failed');
      console.error('[v0] Flash loan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flash Loans</h1>
          <p className="text-muted-foreground mt-2">Access unlimited liquidity for one transaction</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please connect your wallet to use flash loans</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flash Loans</h1>
        <p className="text-muted-foreground mt-2">Access unlimited liquidity for one transaction with {(FLASH_LOAN_PREMIUM * 100).toFixed(2)}% premium</p>
      </div>

      {error && (
        <Alert className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-primary/50 bg-primary/5">
        <Zap className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/90">
          Flash loans must be repaid within the same transaction. Non-repayment will cause revert.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flash Loan Interface */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Request Flash Loan</h2>

          <div className="space-y-6">
            {/* Asset Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Asset</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TOKENS).map(([key, token]) => {
                  const reserve = reserves.find(
                    r => r.asset?.address?.toLowerCase() === token.address?.toLowerCase()
                  );
                  const available = reserve ? parseFloat(reserve.availableLiquidity) : 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedToken(key)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedToken === key
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold text-foreground">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground">{(available / 1000000).toFixed(1)}M available</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setAmount(availableLiquidity.toString())}
                  size="sm"
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Fee Calculator */}
            {amount && (
              <Card className="bg-secondary/50 border-border p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">Fee Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-medium text-foreground">{amount} {TOKENS[selectedToken]?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium ({(FLASH_LOAN_PREMIUM * 100).toFixed(2)}%)</span>
                    <span className="font-medium text-accent">{premiumAmount.toFixed(6)} {TOKENS[selectedToken]?.symbol}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground font-medium">Total Repay</span>
                    <span className="font-bold text-foreground">{totalRepay.toFixed(6)} {TOKENS[selectedToken]?.symbol}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Requirements */}
            <Card className="bg-destructive/5 border-destructive/20 p-4 space-y-2">
              <h3 className="font-semibold text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Requirements
              </h3>
              <ul className="text-xs text-destructive/80 space-y-1 list-disc list-inside">
                <li>Implement executeOperation function</li>
                <li>Repay full amount + premium in same transaction</li>
                <li>Non-repayment causes transaction revert</li>
              </ul>
            </Card>

            <Button
              onClick={handleExecuteFlashLoan}
              disabled={!amount || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isLoading ? 'Processing...' : `Execute Flash Loan`}
            </Button>
          </div>
        </Card>

        {/* Code Examples */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Code Examples
          </h2>

          <Tabs value={selectedExample} onValueChange={(v) => setSelectedExample(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
              <TabsTrigger value="liquidation">Liquidation</TabsTrigger>
            </TabsList>

            {Object.entries(codeExamples).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <div className="mt-4 bg-secondary/50 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-xs text-muted-foreground font-mono leading-relaxed">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
            Copy Code
          </Button>
        </Card>
      </div>

      {/* Use Cases */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Arbitrage',
              desc: 'Exploit price differences across protocols without initial capital',
              icon: <span className="w-6 h-6">Arbitrage Icon</span>, // Placeholder for icon
            },
            {
              title: 'Liquidation',
              desc: 'Liquidate underwater positions to earn liquidation bonus',
              icon: <span className="w-6 h-6">Liquidation Icon</span>, // Placeholder for icon
            },
            {
              title: 'Self-liquidation',
              desc: 'Close positions and repay debt efficiently in one transaction',
              icon: <span className="w-6 h-6">Self-liquidation Icon</span>, // Placeholder for icon
            },
          ].map((useCase) => (
            <div key={useCase.title} className="p-4 bg-secondary/50 rounded-lg space-y-3">
              <div className="text-accent">{useCase.icon}</div>
              <h3 className="font-semibold text-foreground">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Flash Loan FAQs</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What happens if I don\'t repay the flash loan?',
              a: 'The entire transaction reverts. Your account remains unaffected.',
            },
            {
              q: 'Can I use flash loans for personal gain?',
              a: 'Yes, as long as you repay the principal + 0.05% premium in the same transaction.',
            },
            {
              q: 'What\'s the maximum amount I can borrow?',
              a: 'Up to the entire liquidity available in a reserve at that moment.',
            },
            {
              q: 'How do I receive the loaned assets?',
              a: 'Assets are sent to your contract during executeOperation callback function.',
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border pb-4 last:border-0">
              <p className="font-semibold text-foreground mb-2">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
