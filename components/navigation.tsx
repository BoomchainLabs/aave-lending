'use client';

import { Button } from '@/components/ui/button';
import { BarChart3, Wallet, TrendingUp, Zap } from 'lucide-react';

interface NavigationProps {
  account: string | null;
  activeTab: 'dashboard' | 'lending' | 'portfolio' | 'flash-loan';
  onTabChange: (tab: 'dashboard' | 'lending' | 'portfolio' | 'flash-loan') => void;
}

export default function Navigation({ account, activeTab, onTabChange }: NavigationProps) {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Legend
            </span>
          </div>

          <nav className="flex items-center gap-2 flex-1 justify-center mx-8">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('dashboard')}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'lending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('lending')}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Lending
            </Button>
            <Button
              variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('portfolio')}
              className="gap-2"
            >
              <Wallet className="w-4 h-4" />
              Portfolio
            </Button>
            <Button
              variant={activeTab === 'flash-loan' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('flash-loan')}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Flash Loans
            </Button>
          </nav>

          <div className="px-4 py-2 bg-secondary rounded-lg">
            <p className="text-sm text-foreground font-medium">
              {account ? formatAddress(account) : 'Not Connected'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
