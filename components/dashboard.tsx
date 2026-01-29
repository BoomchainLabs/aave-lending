'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getUserAccountData } from '@/lib/web3';
import { TrendingUp, AlertCircle } from 'lucide-react';
import Analytics from './analytics';

interface AccountData {
  totalCollateral: string;
  totalDebt: string;
  availableBorrows: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

interface DashboardContentProps {
  account: string | null;
}

interface ReserveInfo {
  asset: string;
  value: number;
  tvl: number;
  apy: number;
}

export default function DashboardContent({ account }: DashboardContentProps) {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [reserves, setReserves] = useState<ReserveInfo[]>([]);
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
        const [accountResponse, reservesResponse] = await Promise.all([
          fetch(`/api/user/account?address=${account}`),
          fetch('/api/reserves'),
        ]);

        if (!accountResponse.ok || !reservesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const accountDataResponse = await accountResponse.json();
        const reservesData = await reservesResponse.json();
        
        setAccountData(accountDataResponse);
        setReserves(reservesData.slice(0, 3)); // Top 3 reserves
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('[v0] Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [account]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor your DeFi portfolio and protocol analytics</p>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/50 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Key Metrics */}
      {accountData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Collateral</p>
              <p className="text-2xl font-bold text-foreground">${parseFloat(accountData.totalCollateral).toFixed(2)}</p>
              <p className="text-xs text-accent">Assets deposited</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
              <p className="text-2xl font-bold text-foreground">${parseFloat(accountData.totalDebt).toFixed(2)}</p>
              <p className="text-xs text-accent">Amount borrowed</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Health Factor</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-accent">{parseFloat(accountData.healthFactor).toFixed(2)}</p>
                {parseFloat(accountData.healthFactor) > 1.5 && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Healthy</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Liquidation safety</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Available Borrows</p>
              <p className="text-2xl font-bold text-foreground">${parseFloat(accountData.availableBorrows).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Can borrow more</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">LTV Ratio</p>
              <p className="text-2xl font-bold text-foreground">{(parseFloat(accountData.ltv) / 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Loan-to-value</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Liquidation Threshold</p>
              <p className="text-2xl font-bold text-foreground">{(parseFloat(accountData.currentLiquidationThreshold) / 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Risk threshold</p>
            </div>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading account data...</p>
          </div>
        </div>
      )}

      {accountData && (
        <>
          {/* Charts */}
          {reserves.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Reserve APY Comparison
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reserves}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                      <XAxis dataKey="asset" stroke="#8b949e" />
                      <YAxis stroke="#8b949e" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#161b22',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="apy" fill="#7c3aed" name="APY (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Reserve TVL Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reserves}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ asset, value }) => `${asset} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reserves.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#161b22',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Top Reserves */}
          {reserves.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Top Reserves</h2>
              <div className="space-y-3">
                {reserves.map((reserve) => (
                  <div key={reserve.asset} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{reserve.asset}</p>
                      <p className="text-sm text-muted-foreground">TVL: ${(reserve.tvl / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">{reserve.value}%</p>
                      <p className="text-xs text-muted-foreground">APY: {reserve.apy.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Analytics Section */}
          <Analytics />
        </>
      )}
    </div>
  );
}
