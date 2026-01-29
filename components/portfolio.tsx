'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, Zap, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserAccountData } from '@/lib/web3';

interface PortfolioTrackerProps {
  account: string | null;
}

interface AccountData {
  totalCollateral: string;
  totalDebt: string;
  availableBorrows: string;
  healthFactor: string;
}



export default function PortfolioTracker({ account }: PortfolioTrackerProps) {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!account) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getUserAccountData(account);
        setAccountData(data as AccountData);
        setError(null);
      } catch (err) {
        setError('Failed to load portfolio data');
        console.error('[v0] Portfolio error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [account]);

  const totalDeposits = accountData ? parseFloat(accountData.totalCollateral) : 0;
  const totalBorrows = accountData ? parseFloat(accountData.totalDebt) : 0;
  const netValue = totalDeposits - totalBorrows;
  const healthFactor = accountData ? parseFloat(accountData.healthFactor) : 0;
  const isHealthy = healthFactor > 1.5;

  if (!account) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Tracker</h1>
          <p className="text-muted-foreground mt-2">Monitor your positions and earned rewards</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please connect your wallet to view your portfolio</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfolio Tracker</h1>
        <p className="text-muted-foreground mt-2">Monitor your positions and health factor</p>
      </div>

      {error && (
        <Alert className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </Card>
      ) : accountData ? (
        <>
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Collateral</p>
              <p className="text-3xl font-bold text-foreground">${totalDeposits.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-accent mt-2">Deposits value</p>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Debt</p>
              <p className="text-3xl font-bold text-destructive">${totalBorrows.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-2">Amount owed</p>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Net Value</p>
              <p className="text-3xl font-bold text-accent">${netValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-accent mt-2">Net position</p>
            </Card>

            <Card className={`p-6 ${isHealthy ? 'bg-green-500/5' : 'bg-destructive/5'}`}>
              <p className="text-sm font-medium text-muted-foreground mb-2">Health Factor</p>
              <p className={`text-3xl font-bold ${isHealthy ? 'text-green-500' : 'text-destructive'}`}>
                {healthFactor.toFixed(2)}
              </p>
              <p className={`text-xs mt-2 ${isHealthy ? 'text-green-500' : 'text-destructive'}`}>
                {isHealthy ? 'Healthy' : 'At Risk'}
              </p>
            </Card>
          </div>
        </>
      ) : null}

      {accountData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex gap-4">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Account Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Your portfolio contains {totalDeposits > 0 ? 'deposits' : 'no deposits'} and{' '}
                    {totalBorrows > 0 ? 'active borrows' : 'no borrows'}. Your health factor determines if you're at risk of liquidation.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Health Info */}
          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex gap-4">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Health Factor</h3>
                <p className="text-sm text-muted-foreground">
                  Your health factor is a measure of your account's solvency. A factor below 1.0 means your position is at risk of liquidation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
