'use client';

import { useRef, useState, useEffect, KeyboardEvent } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import WorkoutTracker from '@/components/WorkoutTracker';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

function hasAccess(metadata: Record<string, unknown>): boolean {
  if (metadata.subscriptionStatus === 'active') return true;
  if (metadata.trialStartDate) {
    const days =
      (Date.now() - new Date(metadata.trialStartDate as string).getTime()) /
      86_400_000;
    return days < 7;
  }
  return false;
}

function trialDaysLeft(metadata: Record<string, unknown>): number | null {
  if (!metadata.trialStartDate) return null;
  const elapsed =
    (Date.now() - new Date(metadata.trialStartDate as string).getTime()) /
    86_400_000;
  const left = Math.ceil(7 - elapsed);
  return left > 0 ? left : 0;
}

export default function AppPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const sessionId = useRef<string>(crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize trial on first visit
  useEffect(() => {
    if (!isLoaded || !user) return;

    const metadata = user.publicMetadata as Record<string, unknown>;

    async function init() {
      if (!metadata.trialStartDate) {
        await fetch('/api/user/init', { method: 'POST' });
        await user!.reload();
      }

      const refreshed = user!.publicMetadata as Record<string, unknown>;
      if (!hasAccess(refreshed)) {
        router.push('/subscribe');
        return;
      }
      setInitializing(false);
    }

    init();
  }, [isLoaded, user, router]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isLoaded || initializing) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
        Loading…
      </div>
    );
  }

  const daysLeft =
    user && (user.publicMetadata as Record<string, unknown>).subscriptionStatus !== 'active'
      ? trialDaysLeft(user.publicMetadata as Record<string, unknown>)
      : null;

  return (
    <div className="flex h-full text-white overflow-hidden">
      {/* ── Left sidebar ── */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800 overflow-y-auto">
        <div className="px-4 pt-5 pb-2">
          <h2 className="text-base font-semibold tracking-tight">Workout Tracker</h2>
          <p className="text-xs text-zinc-500">Current month resets on the 1st</p>
        </div>
        <WorkoutTracker />
      </div>

      {/* ── Right: chat ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">FitCoach AI</h1>
            <p className="text-sm text-zinc-400">Your personal fitness coach</p>
          </div>
          <div className="flex items-center gap-3">
            {daysLeft !== null && (
              <span className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in trial
              </span>
            )}
            <button
              onClick={() => router.push('/subscribe')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {(user?.publicMetadata as Record<string, unknown>).subscriptionStatus === 'active'
                ? 'Manage plan'
                : 'Upgrade'}
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-zinc-500 text-sm mt-12">
              Ask me anything about workouts or nutrition.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-zinc-100'
                }`}
              >
                {msg.role === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                      h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="font-semibold mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="font-semibold mb-1">{children}</h3>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl px-4 py-3 text-zinc-400 text-sm">
                <span className="animate-pulse">···</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="flex-shrink-0 border-t border-zinc-800 px-4 py-4">
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <textarea
              className="flex-1 resize-none rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 text-sm focus:outline-none focus:border-green-600 transition-colors"
              rows={1}
              placeholder="Ask about workouts or nutrition…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-center text-zinc-600 text-xs mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </footer>
      </div>
    </div>
  );
}
