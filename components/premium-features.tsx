'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  TrendingUp,
  Brain,
  Bell,
  BarChart3,
  Shield,
  Lock,
  Gauge,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface PremiumFeaturesProps {
  account: string | null;
}

const premiumFeatures = [
  {
    icon: Brain,
    title: 'AI Price Prediction',
    description: 'Advanced ML models predicting asset price movements with 85%+ accuracy',
    benefits: ['Real-time predictions', 'Historical backtesting', 'Confidence scores'],
    tier: 'pro',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Customizable alerts for price changes, liquidation risks, and APY shifts',
    benefits: ['Email & webhook notifications', 'Custom thresholds', 'Portfolio monitoring'],
    tier: 'pro',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep portfolio analytics with risk assessment and opportunity detection',
    benefits: ['Risk metrics', 'Opportunity finder', 'Performance attribution'],
    tier: 'pro',
  },
  {
    icon: Zap,
    title: 'Priority Flash Loan Execution',
    description: 'Priority execution queue for flash loan transactions during high gas periods',
    benefits: ['Faster execution', 'Gas optimization', 'MEV protection'],
    tier: 'enterprise',
  },
  {
    icon: Shield,
    title: 'Advanced Risk Management',
    description: 'Insurance coverage and liquidation protection for your positions',
    benefits: ['Position insurance', 'Liquidation protection', 'Emergency withdrawal'],
    tier: 'enterprise',
  },
  {
    icon: Gauge,
    title: 'Position Automation',
    description: 'Automatic rebalancing and yield optimization strategies',
    benefits: ['Auto-rebalancing', 'Yield farming automation', 'Tax optimization'],
    tier: 'enterprise',
  },
];

export default function PremiumFeatures({ account }: PremiumFeaturesProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'enterprise'>('pro');

  const filteredFeatures = premiumFeatures.filter(f => f.tier === selectedTier);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Premium Features</h2>
        <p className="text-muted-foreground text-lg">
          Unlock advanced tools to maximize your DeFi strategy
        </p>
      </div>

      {/* Tier Selection */}
      <div className="flex gap-4 mb-8">
        <Button
          variant={selectedTier === 'pro' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('pro')}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Pro Tier
        </Button>
        <Button
          variant={selectedTier === 'enterprise' ? 'default' : 'outline'}
          onClick={() => setSelectedTier('enterprise')}
          className="flex-1"
        >
          <Lock className="w-4 h-4 mr-2" />
          Enterprise Tier
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card
              key={feature.title}
              className="p-6 hover:border-primary/50 transition-colors flex flex-col"
            >
              <div className="mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {feature.description}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                {account ? (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Enable Feature
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" size="sm" disabled>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pricing Section */}
      <Card className="p-8 bg-primary/5 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Pro Tier</h3>
            <p className="text-3xl font-bold text-primary mb-4">$29<span className="text-lg text-muted-foreground">/mo</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ AI Price Prediction</li>
              <li>✓ Smart Alerts (10/month)</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <div className="md:col-span-1 bg-primary/10 p-6 rounded-lg border border-primary/30">
            <Badge className="mb-4 bg-primary text-primary-foreground">Most Popular</Badge>
            <h3 className="text-xl font-semibold text-foreground mb-2">Premium</h3>
            <p className="text-3xl font-bold text-primary mb-4">$99<span className="text-lg text-muted-foreground">/mo</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ All Pro features</li>
              <li>✓ Unlimited Alerts</li>
              <li>✓ 24/7 support</li>
              <li>✓ Custom strategies</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise</h3>
            <p className="text-3xl font-bold text-primary mb-4">Custom</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ All Premium features</li>
              <li>✓ Position Automation</li>
              <li>✓ Insurance coverage</li>
              <li>✓ Dedicated account manager</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Risk Warning */}
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex gap-4">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              Premium features provide analysis and automation tools but do not guarantee profits or protect against losses.
              DeFi carries inherent risks including smart contract vulnerabilities, liquidation, and market risks. Always conduct
              your own research and never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
