'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Zap, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { connectWallet, getProvider } from '@/lib/web3';
import DashboardContent from '@/components/dashboard';
import LendingInterface from '@/components/lending';
import PortfolioTracker from '@/components/portfolio';
import FlashLoanTool from '@/components/flash-loan';
import Navigation from '@/components/navigation';

type TabType = 'dashboard' | 'lending' | 'portfolio' | 'flash-loan';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  async function checkConnection() {
    try {
      const provider = await getProvider();
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]?.address || null);
        setIsConnected(true);
      }
    } catch {
      setIsConnected(false);
    }
  }

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setAccount(addr);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">DeFi Platform</h1>
            <p className="text-lg text-muted-foreground">
              Access lending, borrowing, and flash loans on Ethereum
            </p>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-2">
              <TrendingUp className="w-6 h-6 text-accent mx-auto" />
              <p className="text-sm font-medium text-foreground">Analytics</p>
            </div>
            <div className="space-y-2">
              <Grid3x3 className="w-6 h-6 text-accent mx-auto" />
              <p className="text-sm font-medium text-foreground">Dashboard</p>
            </div>
            <div className="space-y-2">
              <Zap className="w-6 h-6 text-accent mx-auto" />
              <p className="text-sm font-medium text-foreground">Flash Loans</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation account={account} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardContent account={account} />}
        {activeTab === 'lending' && <LendingInterface account={account} />}
        {activeTab === 'portfolio' && <PortfolioTracker account={account} />}
        {activeTab === 'flash-loan' && <FlashLoanTool account={account} />}
      </main>
    </div>
  );
}
