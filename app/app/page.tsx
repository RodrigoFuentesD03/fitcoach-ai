'use client';

import { useRef, useState, useEffect, KeyboardEvent, Suspense } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import WorkoutTracker from '@/components/WorkoutTracker';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

const STARTER_PROMPTS = [
  'Give me a beginner workout plan for 3 days a week',
  'How do I build muscle on a limited budget?',
  'What should I eat before and after the gym?',
  'I have 30 minutes. Give me a full-body workout.',
];

const STORAGE_KEY = 'fitcoach_messages';
const WELCOME_KEY = 'fitcoach_welcomed';

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
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading your session…</p>
      </div>
    }>
      <AppPageInner />
    </Suspense>
  );
}

function AppPageInner() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useRef<string>(crypto.randomUUID());

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSubscribedBanner, setShowSubscribedBanner] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load persisted messages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Init trial, handle post-checkout activation, show welcome modal
  useEffect(() => {
    if (!isLoaded || !user || hasInitialized.current) return;
    hasInitialized.current = true;

    const metadata = user.publicMetadata as Record<string, unknown>;
    const comingFromCheckout = searchParams.get('subscribed') === '1';
    const stripeSessionId = searchParams.get('session_id');

    async function init() {
      const isNew = !metadata.trialStartDate;

      if (isNew) {
        // Brand new user — create trial + Stripe customer
        await fetch('/api/user/init', { method: 'POST' });
        await user!.reload();
      } else if (comingFromCheckout && stripeSessionId) {
        // Verify payment directly with Stripe — no webhook dependency
        setActivating(true);
        try {
          await fetch('/api/stripe/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: stripeSessionId }),
          });
        } catch {
          // Webhook may have already handled it — continue
        }
        await user!.reload();
        setActivating(false);
        setShowSubscribedBanner(true);
        setTimeout(() => setShowSubscribedBanner(false), 6000);
      }

      const refreshed = user!.publicMetadata as Record<string, unknown>;
      if (!hasAccess(refreshed)) {
        router.push('/subscribe');
        return;
      }

      setInitializing(false);

      if (isNew && !localStorage.getItem(WELCOME_KEY)) {
        setShowWelcome(true);
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  function dismissWelcome() {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_KEY, '1');
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    textareaRef.current?.focus();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: sessionId.current }),
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

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }

  if (!isLoaded || initializing) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        {activating ? (
          <>
            <p className="text-white text-sm font-medium">Activating your subscription…</p>
            <p className="text-zinc-500 text-xs">This takes a few seconds</p>
          </>
        ) : (
          <p className="text-zinc-500 text-sm">Loading your session…</p>
        )}
      </div>
    );
  }

  const metadata = user?.publicMetadata as Record<string, unknown>;
  const isActive = metadata?.subscriptionStatus === 'active';
  const daysLeft = !isActive ? trialDaysLeft(metadata) : null;

  return (
    <>
      {/* Welcome modal */}
      <Dialog open={showWelcome} onOpenChange={(open) => { if (!open) dismissWelcome(); }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Welcome to FitCoach AI 👋</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Here&apos;s how to get the most out of your coach.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {[
              { step: '1', title: 'Ask me anything', desc: 'Workouts, nutrition, recovery, supplements — no question is off-limits.' },
              { step: '2', title: 'Log your workouts', desc: 'Use the tracker on the left to mark your gym days and watch your tier level up.' },
              { step: '3', title: 'I remember you', desc: 'Keep chatting across sessions — I\'ll remember your goals and progress.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={dismissWelcome}
            className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Let&apos;s go
          </button>
        </DialogContent>
      </Dialog>

      <div className="flex h-full text-white overflow-hidden">
        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left sidebar ── */}
        <aside
          className={`
            fixed md:relative z-30 md:z-auto
            w-72 h-full flex-shrink-0
            border-r border-white/5 overflow-y-auto
            bg-zinc-950 md:bg-transparent
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="px-4 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Workout Tracker</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Resets on the 1st each month</p>
            </div>
            <button
              className="md:hidden text-zinc-500 hover:text-white text-lg"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <WorkoutTracker />
        </aside>

        {/* ── Right: chat ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-white/5 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile tracker toggle */}
              <button
                className="md:hidden text-zinc-400 hover:text-white p-1"
                onClick={() => setSidebarOpen(true)}
                title="Open workout tracker"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-xs font-black text-zinc-950">
                F
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">FitCoach AI</p>
                <p className="text-xs text-zinc-500 mt-0.5">Your personal coach</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {daysLeft !== null && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 bg-yellow-400/5 text-[10px] px-2 py-0.5"
                >
                  {daysLeft}d left in trial
                </Badge>
              )}
              <button
                onClick={() => router.push('/subscribe')}
                className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {isActive ? 'Manage plan' : 'Upgrade →'}
              </button>
              <UserButton />
            </div>
          </header>

          {/* Subscribed banner */}
          {showSubscribedBanner && (
            <div className="flex items-center justify-center gap-2 bg-green-600/10 border-b border-green-600/20 px-4 py-2.5 text-sm text-green-400 font-medium">
              <span>🎉</span>
              <span>You&apos;re subscribed — welcome aboard!</span>
            </div>
          )}

          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-8 pb-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                    💪
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-1">What&apos;s your goal today?</h2>
                  <p className="text-sm text-zinc-500">Ask me anything about fitness, nutrition, or training.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-green-500/20 rounded-xl px-4 py-3 transition-colors leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center text-[10px] font-black text-zinc-950 mr-2 mt-0.5 flex-shrink-0">
                    F
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-zinc-900 border border-white/5 text-zinc-100 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        h1: ({ children }) => <h1 className="font-bold text-base mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="font-semibold mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="font-semibold mb-1">{children}</h3>,
                        code: ({ children }) => <code className="bg-zinc-800 px-1 rounded text-xs">{children}</code>,
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
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center text-[10px] font-black text-zinc-950 flex-shrink-0">
                  F
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </main>

          {/* Input */}
          <footer className="flex-shrink-0 border-t border-white/5 px-4 py-3">
            <div className="flex gap-2 items-end max-w-3xl mx-auto">
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-green-600/50 transition-colors min-h-[46px] max-h-40"
                rows={1}
                placeholder="Ask about workouts, nutrition, or recovery…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors h-[46px]"
              >
                Send
              </button>
            </div>
            <p className="text-center text-zinc-700 text-[10px] mt-1.5">
              Enter to send · Shift+Enter for new line
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
