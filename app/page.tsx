import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/app');

  return (
    <div className="min-h-full text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-tight text-green-400">FitCoach AI</span>
        <Link
          href="/sign-in"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/30 text-green-400 text-xs font-medium px-3 py-1 rounded-full mb-8">
          7-day free trial · No credit card required
        </div>

        <h1 className="text-5xl font-black tracking-tight leading-tight max-w-2xl">
          Your AI-powered
          <br />
          <span className="text-green-400">fitness coach</span>
        </h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-md leading-relaxed">
          Get personalized workout plans, nutrition advice, and track your
          progress — all in one place, powered by AI.
        </p>

        <Link
          href="/sign-up"
          className="mt-10 inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
        >
          Start free trial
        </Link>

        <p className="mt-3 text-zinc-600 text-sm">
          Then $1 / month. Cancel anytime.
        </p>
      </main>

      {/* Features */}
      <section className="border-t border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-600/30 flex items-center justify-center text-green-400 text-xl">
              💬
            </div>
            <h3 className="font-semibold text-white">AI Chat Coach</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ask anything about workouts, nutrition, or recovery. Get expert
              answers instantly, tailored to your goals.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-600/30 flex items-center justify-center text-green-400 text-xl">
              📅
            </div>
            <h3 className="font-semibold text-white">Workout Tracker</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Log your gym days on a monthly calendar. Track your streak and
              level up from Rookie to Champion.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-600/30 flex items-center justify-center text-green-400 text-xl">
              🎯
            </div>
            <h3 className="font-semibold text-white">Personalized Plans</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No generic advice. The AI remembers your conversation and adapts
              recommendations to your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-zinc-800 py-20 px-6">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Simple pricing</h2>
          <p className="text-zinc-400 text-sm mb-8">No surprises. Cancel anytime.</p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-5xl font-black text-white">$1</span>
              <span className="text-zinc-400 text-sm mb-2">/ month</span>
            </div>
            <p className="text-green-400 text-sm font-medium mb-6">
              7 days free to start
            </p>
            <ul className="text-sm text-zinc-400 space-y-2 text-left mb-8">
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
            <Link
              href="/sign-up"
              className="block w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 px-6 text-center text-xs text-zinc-600">
        © 2026 FitCoach AI
      </footer>
    </div>
  );
}
