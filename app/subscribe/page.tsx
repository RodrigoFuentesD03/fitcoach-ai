'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  { icon: '💬', text: 'Unlimited AI coaching sessions' },
  { icon: '📅', text: 'Workout tracker with streak tiers' },
  { icon: '🧠', text: 'Session memory across conversations' },
  { icon: '🥗', text: 'Personalized nutrition guidance' },
  { icon: '🎯', text: 'Goal tracking & recommendations' },
  { icon: '❌', text: 'Cancel anytime — no lock-in' },
];

export default function SubscribePage() {
  const { user } = useUser();
  const router = useRouter();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive =
    (user?.publicMetadata as Record<string, unknown>)?.subscriptionStatus === 'active';

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start checkout. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // fail silently — portal isn't critical
    } finally {
      setPortalLoading(false);
    }
  }

  if (isActive) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-6">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Your FitCoach AI subscription is active. Keep training.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/app')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Back to app
            </button>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              {portalLoading ? 'Opening…' : 'Manage billing & cancel'}
            </button>
          </div>
          <p className="text-zinc-600 text-xs mt-3">
            Billing managed securely by Stripe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
            🔓
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unlock FitCoach AI</h1>
          <p className="text-zinc-400 text-sm">
            Your trial has ended. Subscribe to keep training with your AI coach.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              plan === 'monthly'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Monthly
            <span className="block text-xs font-normal opacity-70 mt-0.5">MXN 25 / mo</span>
          </button>
          <button
            onClick={() => setPlan('annual')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              plan === 'annual'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Annual
            <span className="block text-xs font-normal opacity-70 mt-0.5">MXN 250 / yr</span>
            <Badge className="absolute -top-2.5 right-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0 rounded hover:bg-green-600">
              SAVE 17%
            </Badge>
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-6">
          <div className="flex items-end justify-center gap-1.5">
            <span className="text-4xl font-black text-white">
              {plan === 'annual' ? 'MXN 250' : 'MXN 25'}
            </span>
            <span className="text-zinc-400 text-sm mb-1.5">
              / {plan === 'annual' ? 'year' : 'month'}
            </span>
          </div>
          {plan === 'annual' && (
            <p className="text-green-400 text-xs font-medium mt-1">
              That&apos;s MXN 20.83/month — 2 months free
            </p>
          )}
        </div>

        {/* Feature list */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 mb-5">
          <ul className="space-y-3">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="text-base">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {loading
            ? 'Redirecting to checkout…'
            : plan === 'annual'
            ? 'Subscribe — MXN 250 / year'
            : 'Subscribe — MXN 25 / month'}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-3">
          Secure checkout via Stripe · Cancel anytime
        </p>
      </div>
    </div>
  );
}
