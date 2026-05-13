'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SubscribePage() {
  const { user } = useUser();
  const router = useRouter();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {isActive ? (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-2">You're subscribed</h1>
            <p className="text-zinc-400 text-sm mb-8">
              Your FitCoach AI subscription is active.
            </p>
            <button
              onClick={() => router.push('/app')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Back to app
            </button>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">Your trial has ended</h1>
            <p className="text-zinc-400 text-sm mb-8">
              Subscribe to continue using FitCoach AI. Cancel anytime.
            </p>

            {/* Plan toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
              <button
                onClick={() => setPlan('monthly')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  plan === 'monthly'
                    ? 'bg-green-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
                <span className="block text-xs font-normal opacity-80">MXN 25 / mo</span>
              </button>
              <button
                onClick={() => setPlan('annual')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  plan === 'annual'
                    ? 'bg-green-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Annual
                <span className="block text-xs font-normal opacity-80">MXN 250 / yr</span>
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-left">
              <ul className="text-sm text-zinc-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Unlimited AI coaching
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Workout tracker
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Session memory
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Cancel anytime
                </li>
              </ul>
            </div>

            {error && (
              <p className="text-red-400 text-xs mb-4">{error}</p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {loading
                ? 'Redirecting to checkout…'
                : plan === 'annual'
                ? 'Subscribe — MXN 250 / year'
                : 'Subscribe — MXN 25 / month'}
            </button>

            <p className="text-zinc-600 text-xs mt-3">
              You'll be redirected to Stripe's secure checkout.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
