'use client';

import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface AnalyticsData {
  tvlData: any[];
  utilizationData: any[];
  riskMetrics: any[];
  metrics: {
    tvl: string;
    borrowed: string;
    healthFactor: string;
    activeUsers: string;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('[v0] Analytics error:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Protocol Analytics</h2>
          <p className="text-muted-foreground mt-1">Deep dive into DeFi protocol metrics and performance</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Protocol Analytics</h2>
          <p className="text-muted-foreground mt-1">Deep dive into DeFi protocol metrics and performance</p>
        </div>
        <Card className="p-8 text-center border-destructive/50 bg-destructive/10">
          <p className="text-destructive">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Protocol Analytics</h2>
        <p className="text-muted-foreground mt-1">Deep dive into DeFi protocol metrics and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Value Locked</p>
            <p className="text-3xl font-bold text-foreground">{data.metrics.tvl}</p>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Real-time data
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Borrowed</p>
            <p className="text-3xl font-bold text-foreground">{data.metrics.borrowed}</p>
            <p className="text-xs text-muted-foreground">Active borrowing</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Avg. Health Factor</p>
            <p className="text-3xl font-bold text-accent">{data.metrics.healthFactor}</p>
            <p className="text-xs text-accent">Network status</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-3xl font-bold text-foreground">{data.metrics.activeUsers}</p>
            <p className="text-xs text-accent">Connected wallets</p>
          </div>
        </Card>
      </div>

      {/* TVL & Utilization Trends */}
      {data.tvlData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">TVL Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.tvlData}>
                <defs>
                  <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="date" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="#7c3aed"
                  fillOpacity={1}
                  fill="url(#colorTvl)"
                  name="TVL ($M)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Reserve Utilization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.utilizationData}>
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
                <Legend />
                <Bar dataKey="utilization" fill="#10b981" name="Utilization (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* APY Comparison */}
      {data.utilizationData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">APY Rates by Asset</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.utilizationData}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="apy"
                stroke="#7c3aed"
                name="Supply APY (%)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="borrow"
                stroke="#f59e0b"
                name="Borrow Rate (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Risk Assessment */}
      {data.riskMetrics.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Risk Assessment
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reserve</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">LTV</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Threshold</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Health</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {data.riskMetrics.map((metric) => (
                  <tr key={metric.reserve} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="py-3 px-4 font-medium text-foreground">{metric.reserve}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.ltv > 80 ? 'bg-destructive' : 'bg-accent'
                            }`}
                            style={{ width: `${metric.ltv}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{metric.ltv}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{metric.threshold}%</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-accent">{metric.health.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          metric.risk === 'Low'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {metric.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Asset Performance */}
      {data.utilizationData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Asset Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.utilizationData.map((asset) => (
              <div
                key={asset.asset}
                className="p-4 bg-secondary/50 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{asset.asset}</h4>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {asset.utilization.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supply APY</span>
                    <span className="text-accent font-medium">{asset.apy.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Borrow Rate</span>
                    <span className="text-destructive font-medium">{asset.borrow.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="w-full bg-border rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{ width: `${asset.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
