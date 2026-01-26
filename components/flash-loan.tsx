'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, Code2, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FlashLoanToolProps {
  account: string | null;
}

const flashLoanAssets = [
  { symbol: 'ETH', available: 50000, premium: 0.05 },
  { symbol: 'USDC', available: 100000000, premium: 0.05 },
  { symbol: 'DAI', available: 50000000, premium: 0.05 },
  { symbol: 'USDT', available: 30000000, premium: 0.05 },
];

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

export default function FlashLoanTool({ account }: FlashLoanToolProps) {
  const [selectedAsset, setSelectedAsset] = useState(flashLoanAssets[0]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExample, setSelectedExample] = useState<'arbitrage' | 'liquidation'>('arbitrage');

  const premium = selectedAsset.premium;
  const premiumAmount = amount ? parseFloat(amount) * premium : 0;
  const totalRepay = amount ? parseFloat(amount) + premiumAmount : 0;

  const handleExecuteFlashLoan = async () => {
    if (!amount || !account) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAmount('');
    } catch (error) {
      console.error('Flash loan execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flash Loans</h1>
        <p className="text-muted-foreground mt-2">Access unlimited liquidity for one transaction</p>
      </div>

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
                {flashLoanAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedAsset.symbol === asset.symbol
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold text-foreground">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{(asset.available / 1000000).toFixed(0)}M available</p>
                  </button>
                ))}
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
                  onClick={() => setAmount((selectedAsset.available / 1000000).toFixed(0))}
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
                    <span className="font-medium text-foreground">{amount} {selectedAsset.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium ({premium * 100}%)</span>
                    <span className="font-medium text-accent">{premiumAmount.toFixed(6)} {selectedAsset.symbol}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground font-medium">Total Repay</span>
                    <span className="font-bold text-foreground">{totalRepay.toFixed(6)} {selectedAsset.symbol}</span>
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
              icon: <TrendingUp className="w-6 h-6" />,
            },
            {
              title: 'Liquidation',
              desc: 'Liquidate underwater positions to earn liquidation bonus',
              icon: <DollarSign className="w-6 h-6" />,
            },
            {
              title: 'Self-liquidation',
              desc: 'Close positions and repay debt efficiently in one transaction',
              icon: <Zap className="w-6 h-6" />,
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

import { TrendingUp } from 'lucide-react';
