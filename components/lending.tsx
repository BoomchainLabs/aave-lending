'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Zap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOKENS } from '@/lib/contracts';
import { useTransactionMonitor } from '@/hooks/use-transaction-monitor';
import { useNotification } from '@/hooks/use-notification';

interface LendingInterfaceProps {
  account: string | null;
}

interface ReserveData {
  asset: any;
  liquidityRate: number;
  variableBorrowRate: number;
  availableLiquidity: string;
}

const assets = Object.values(TOKENS);

export default function LendingInterface({ account }: LendingInterfaceProps) {
  const [reserves, setReserves] = useState<ReserveData[]>([]);
  const [activeToken, setActiveToken] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { executeTransaction, status } = useTransactionMonitor();
  const { success, error: errorToast, loading, updateLoading } = useNotification();
  const [activeAsset, setActiveAsset] = useState<any>(null);

  useEffect(() => {
    fetchReserves();
    if (Object.keys(TOKENS).length > 0) {
      setActiveToken(Object.keys(TOKENS)[0]);
      setActiveAsset(TOKENS[Object.keys(TOKENS)[0]]);
    }
  }, []);

  const fetchReserves = async () => {
    try {
      const response = await fetch('/api/reserves');
      if (!response.ok) throw new Error('Failed to fetch reserves');
      const data = await response.json();
      setReserves(data);
    } catch (err) {
      console.error('[v0] Error fetching reserves:', err);
      setError('Failed to load reserve data');
    }
  };

  const handleDeposit = async () => {
    if (!amount || !account || !activeToken) {
      errorToast('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    const toastId = loading(`Depositing ${amount} ${TOKENS[activeToken]?.symbol}...`);
    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          tokenAddress: TOKENS[activeToken]?.address || '',
          amount,
        }),
      });
      if (!response.ok) throw new Error('Deposit transaction failed');
      setAmount('');
      await executeTransaction();
      await fetchReserves();
      updateLoading(toastId, `Successfully deposited ${amount} ${TOKENS[activeToken]?.symbol}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Deposit failed';
      setError(errorMsg);
      updateLoading(toastId, errorMsg, 'error');
      console.error('[v0] Deposit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!amount || !account || !activeToken) {
      errorToast('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    const toastId = loading(`Borrowing ${amount} ${TOKENS[activeToken]?.symbol}...`);
    try {
      const response = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          tokenAddress: TOKENS[activeToken]?.address || '',
          amount,
          interestRateMode: 2,
        }),
      });
      if (!response.ok) throw new Error('Borrow transaction failed');
      setAmount('');
      await executeTransaction();
      await fetchReserves();
      updateLoading(toastId, `Successfully borrowed ${amount} ${TOKENS[activeToken]?.symbol}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Borrow failed';
      setError(errorMsg);
      updateLoading(toastId, errorMsg, 'error');
      console.error('[v0] Borrow error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeReserve = reserves.find(
    r => r.asset?.address?.toLowerCase() === TOKENS[activeToken]?.address?.toLowerCase()
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lending & Borrowing</h1>
        <p className="text-muted-foreground mt-2">Deposit assets to earn APY or borrow against your collateral</p>
      </div>

      {error && (
        <Alert className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Selector */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Assets</h2>
          <div className="space-y-3">
            {Object.entries(TOKENS).map(([key, token]) => {
              const reserve = reserves.find(r => r.asset?.address?.toLowerCase() === token.address?.toLowerCase());
              const apy = reserve ? (Number(reserve.liquidityRate) / 10 ** 27 * 100).toFixed(2) : '0.00';
              return (
                <button
                  key={key}
                  onClick={() => setActiveToken(key)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    activeToken === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{token.symbol.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground">{apy}% APY</p>
                    </div>
                  </div>
                </button>
              );
            })}
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
                  <p className="text-2xl font-bold text-foreground">{TOKENS[activeToken]?.symbol || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Supply APY</p>
                  <p className="text-2xl font-bold text-accent">
                    {activeReserve ? (Number(activeReserve.liquidityRate) / 10 ** 27 * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Available Liquidity</p>
                  <p className="text-lg font-semibold text-foreground">
                    {activeReserve ? parseFloat(activeReserve.availableLiquidity).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Borrow Rate</p>
                  <p className="text-lg font-semibold text-accent">
                    {activeReserve ? (Number(activeReserve.variableBorrowRate) / 10 ** 27 * 100).toFixed(2) : '0.00'}%
                  </p>
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
                      onClick={() => setAmount(activeAsset?.balance.toString())}
                      size="sm"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Supply APY</span>
                    <span className="text-accent font-semibold">
                      {activeReserve ? (Number(activeReserve.liquidityRate) / 10 ** 27 * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Annual Earnings</span>
                    <span className="text-foreground font-semibold">
                      {amount && activeReserve
                        ? (
                            parseFloat(amount) *
                            (Number(activeReserve.liquidityRate) / 10 ** 27)
                          ).toFixed(6)
                        : '0.00'}{' '}
                      {TOKENS[activeToken]?.symbol}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={!amount || isLoading || status === 'executing'}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isLoading || status === 'executing' ? 'Processing...' : `Deposit ${TOKENS[activeToken]?.symbol}`}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAmount(
                          activeReserve ? parseFloat(activeReserve.availableLiquidity).toString() : ''
                        )
                      }
                    >
                      Max Available
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Borrow Rate (Variable)</span>
                    <span className="text-accent font-semibold">
                      {activeReserve ? (Number(activeReserve.variableBorrowRate) / 10 ** 27 * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Monthly Cost</span>
                    <span className="text-foreground font-semibold">
                      {amount && activeReserve
                        ? (
                            (parseFloat(amount) *
                              (Number(activeReserve.variableBorrowRate) / 10 ** 27)) /
                            12
                          ).toFixed(6)
                        : '0.00'}{' '}
                      {TOKENS[activeToken]?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Health Impact</span>
                    <span className="text-destructive font-semibold">Decreases</span>
                  </div>
                </div>

                <Button
                  onClick={handleBorrow}
                  disabled={!amount || isLoading || status === 'executing'}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  {isLoading || status === 'executing' ? 'Processing...' : `Borrow ${TOKENS[activeToken]?.symbol}`}
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
