'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, Zap } from 'lucide-react';

interface Position {
  asset: string;
  type: 'deposit' | 'borrow';
  amount: number;
  apy: number;
  value: number;
  change24h: number;
}

interface PortfolioTrackerProps {
  account: string | null;
}

const mockPositions: Position[] = [
  { asset: 'ETH', type: 'deposit', amount: 5.234, apy: 4.5, value: 18450, change24h: 2.5 },
  { asset: 'USDC', type: 'deposit', amount: 10000, apy: 3.2, value: 10000, change24h: 0 },
  { asset: 'DAI', type: 'deposit', amount: 8500, apy: 2.8, value: 8500, change24h: 0.1 },
  { asset: 'USDT', type: 'borrow', amount: 2500, apy: 2.5, value: 2500, change24h: 0 },
];

const mockRewards = [
  { asset: 'AAVE', earned: 245.5, value: 35420 },
  { asset: 'stkAAVE', earned: 12.3, value: 2150 },
];

export default function PortfolioTracker({ account }: PortfolioTrackerProps) {
  const totalDeposits = mockPositions
    .filter(p => p.type === 'deposit')
    .reduce((sum, p) => sum + p.value, 0);
  
  const totalBorrows = mockPositions
    .filter(p => p.type === 'borrow')
    .reduce((sum, p) => sum + p.value, 0);

  const netValue = totalDeposits - totalBorrows;
  const totalRewardsValue = mockRewards.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfolio Tracker</h1>
        <p className="text-muted-foreground mt-2">Monitor your positions and earned rewards</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Deposits</p>
          <p className="text-3xl font-bold text-foreground">${totalDeposits.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-accent mt-2">+$450 this month</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Borrows</p>
          <p className="text-3xl font-bold text-destructive">${totalBorrows.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-2">At variable rate</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Net Portfolio Value</p>
          <p className="text-3xl font-bold text-accent">${netValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-accent mt-2">Available assets</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Earned Rewards</p>
          <p className="text-3xl font-bold text-primary">${totalRewardsValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
            Claim Rewards
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deposits */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Deposits
            </h2>
            <div className="space-y-3">
              {mockPositions
                .filter(p => p.type === 'deposit')
                .map((position) => (
                  <div
                    key={position.asset}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center font-semibold text-primary">
                          {position.asset.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{position.asset}</p>
                          <p className="text-xs text-muted-foreground">{position.amount} {position.asset}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-foreground">${position.value.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <span className="text-accent">{position.apy}% APY</span>
                        {position.change24h > 0 ? (
                          <span className="text-accent flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +{position.change24h}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No change</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Borrows */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Borrows
            </h2>
            <div className="space-y-3">
              {mockPositions
                .filter(p => p.type === 'borrow')
                .map((position) => (
                  <div
                    key={position.asset}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center font-semibold text-destructive">
                          {position.asset.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{position.asset}</p>
                          <p className="text-xs text-muted-foreground">{position.amount} {position.asset}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-destructive">${position.value.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <span className="text-destructive">{position.apy}% Rate</span>
                        <Button size="sm" variant="ghost" className="ml-2 h-6 px-2">
                          Repay
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Rewards Sidebar */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Rewards
          </h2>
          <div className="space-y-4">
            {mockRewards.map((reward) => (
              <div key={reward.asset} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-foreground">{reward.asset}</p>
                  <p className="text-sm text-muted-foreground">{reward.earned}</p>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${(reward.earned / 250) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">${reward.value.toLocaleString()}</p>
              </div>
            ))}
            <Button className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              Claim All Rewards
            </Button>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {[
            { date: '2 hours ago', action: 'Deposited 2.5 ETH', amount: '+$8,750', type: 'in' },
            { date: '1 day ago', action: 'Borrowed 1000 USDC', amount: '-$1,000', type: 'out' },
            { date: '3 days ago', action: 'Deposited 5000 DAI', amount: '+$5,000', type: 'in' },
            { date: '5 days ago', action: 'Claimed Rewards', amount: '+$450', type: 'reward' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-foreground">{tx.action}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <p className={`font-semibold ${tx.type === 'in' ? 'text-accent' : tx.type === 'reward' ? 'text-primary' : 'text-foreground'}`}>
                {tx.amount}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
