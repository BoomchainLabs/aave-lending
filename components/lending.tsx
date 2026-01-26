'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface LendingInterfaceProps {
  account: string | null;
}

const assets = [
  { symbol: 'ETH', name: 'Ethereum', apy: 4.5, icon: '⟠', balance: 5.234, borrowed: 0 },
  { symbol: 'USDC', name: 'USD Coin', apy: 3.2, icon: '⊙', balance: 10000, borrowed: 0 },
  { symbol: 'DAI', name: 'Dai', apy: 2.8, icon: '◆', balance: 8500, borrowed: 2500 },
  { symbol: 'USDT', name: 'Tether', apy: 3.1, icon: '⊕', balance: 5000, borrowed: 0 },
];

export default function LendingInterface({ account }: LendingInterfaceProps) {
  const [activeAsset, setActiveAsset] = useState(assets[0]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || !account) return;
    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAmount('');
      // In real implementation, would call contract
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!amount || !account) return;
    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAmount('');
      // In real implementation, would call contract
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lending & Borrowing</h1>
        <p className="text-muted-foreground mt-2">Deposit assets to earn APY or borrow against your collateral</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Selector */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Assets</h2>
          <div className="space-y-3">
            {assets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setActiveAsset(asset)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  activeAsset.symbol === asset.symbol
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{asset.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.apy}% APY</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Interface */}
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-6">
            {/* Asset Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Asset</p>
                  <p className="text-2xl font-bold text-foreground">{activeAsset.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current APY</p>
                  <p className="text-2xl font-bold text-accent">{activeAsset.apy}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
                  <p className="text-lg font-semibold text-foreground">{activeAsset.balance} {activeAsset.symbol}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Amount Borrowed</p>
                  <p className="text-lg font-semibold text-destructive">{activeAsset.borrowed} {activeAsset.symbol}</p>
                </div>
              </div>
            </div>

            {/* Deposit/Borrow Tabs */}
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit" className="gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="borrow" className="gap-2">
                  <ArrowDown className="w-4 h-4" />
                  Borrow
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount to Deposit</label>
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
                      onClick={() => setAmount(activeAsset.balance.toString())}
                      size="sm"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated APY</span>
                    <span className="text-accent font-semibold">{activeAsset.apy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Annual Earnings</span>
                    <span className="text-foreground font-semibold">
                      {amount ? (parseFloat(amount) * activeAsset.apy / 100).toFixed(2) : '0.00'} {activeAsset.symbol}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={!amount || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : `Deposit ${activeAsset.symbol}`}
                </Button>
              </TabsContent>

              <TabsContent value="borrow" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount to Borrow</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      Max Available
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Borrow Rate</span>
                    <span className="text-accent font-semibold">2.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Monthly Cost</span>
                    <span className="text-foreground font-semibold">
                      {amount ? (parseFloat(amount) * 2.5 / 100 / 12).toFixed(4) : '0.00'} {activeAsset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Health Impact</span>
                    <span className="text-destructive font-semibold">Decreases</span>
                  </div>
                </div>

                <Button
                  onClick={handleBorrow}
                  disabled={!amount || isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : `Borrow ${activeAsset.symbol}`}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex gap-4">
          <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">About Lending & Borrowing</h3>
            <p className="text-sm text-muted-foreground">
              Deposit your assets to earn APY on the lending market. Your deposits serve as collateral for borrowing. 
              Always monitor your health factor - if it drops below 1.0, you risk liquidation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
