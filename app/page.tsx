import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const testimonials = [
  {
    name: 'Carlos M.',
    handle: '@carlosfit',
    text: 'I went from not knowing what to eat to having a full meal plan in 5 minutes. This thing actually listens.',
    initials: 'CM',
    color: 'bg-emerald-600',
  },
  {
    name: 'Sofía R.',
    handle: '@sofialifts',
    text: 'The workout tracker keeps me accountable. Hitting Champion tier last month felt incredible.',
    initials: 'SR',
    color: 'bg-violet-600',
  },
  {
    name: 'Diego A.',
    handle: '@diegogains',
    text: 'Other AI apps give generic advice. FitCoach actually remembers what we talked about last time.',
    initials: 'DA',
    color: 'bg-orange-600',
  },
];

const features = [
  {
    icon: '💬',
    title: 'AI Chat Coach',
    desc: 'Ask anything — workout splits, nutrition, recovery, supplements. Get expert answers instantly, adapted to your goals and history.',
  },
  {
    icon: '📅',
    title: 'Workout Tracker',
    desc: 'Log your gym days on a monthly calendar. Track consistency and level up from Rookie to Champion as your streak builds.',
  },
  {
    icon: '🧠',
    title: 'Session Memory',
    desc: "The AI remembers what you told it. No need to repeat your goals, injuries, or preferences every single conversation.",
  },
  {
    icon: '🥗',
    title: 'Nutrition Guidance',
    desc: 'Get meal ideas, macro breakdowns, and eating strategies tailored to your training style and body composition goals.',
  },
  {
    icon: '🎯',
    title: 'Goal Setting',
    desc: 'Define your goals once. The coach references them automatically when making recommendations.',
  },
  {
    icon: '📈',
    title: 'Progress Tiers',
    desc: 'Four achievement tiers — Rookie, Dedicated, Warrior, Champion — that level up as you build your workout streak.',
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/app');

  return (
    <div className="min-h-full text-white flex flex-col bg-zinc-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-xs font-black text-zinc-950">
            F
          </div>
          <span className="text-base font-bold tracking-tight">FitCoach AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-24 pb-16">
        <Badge
          variant="outline"
          className="mb-8 border-green-500/30 text-green-400 bg-green-500/5 px-4 py-1.5 text-xs font-medium rounded-full"
        >
          7-day free trial · No credit card required
        </Badge>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl">
          The fitness coach that{' '}
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            actually knows you
          </span>
        </h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-lg leading-relaxed">
          Personalized workout plans, nutrition advice, and a streak tracker — all powered by AI that remembers your goals and adapts every answer to your situation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link
            href="/sign-up"
            className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/sign-in"
            className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-4 text-zinc-600 text-sm">
          Then MXN 25 / month. Cancel anytime.
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/5 w-full max-w-2xl">
          {[
            { n: '2,300+', label: 'workouts logged' },
            { n: '4.9 ★', label: 'average rating' },
            { n: '7 days', label: 'free to start' },
            { n: '< 3s', label: 'average response' },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-white">{n}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Testimonials */}
      <section className="border-t border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-zinc-500 uppercase tracking-widest font-medium mb-10">
            What members are saying
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, handle, text, initials, color }) => (
              <div
                key={name}
                className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-green-500/20 transition-colors"
              >
                <p className="text-sm text-zinc-300 leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-zinc-500">{handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to train smarter</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Not just a chatbot. A complete fitness system that works around your schedule and goals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-3 hover:border-green-500/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl">
                  {icon}
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple, honest pricing</h2>
            <p className="text-zinc-400 text-sm">One plan. Everything included. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Monthly</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black">MXN 25</span>
                  <span className="text-zinc-400 text-sm mb-1">/ month</span>
                </div>
                <p className="text-green-400 text-sm font-medium mt-1">7-day free trial</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {['Unlimited AI coaching', 'Workout tracker', 'Session memory', 'Nutrition guidance', 'Cancel anytime'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <span className="text-green-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Annual — highlighted */}
            <div className="bg-zinc-900 border border-green-500/30 rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-green-600">
                  BEST VALUE
                </Badge>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Annual</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black">MXN 250</span>
                  <span className="text-zinc-400 text-sm mb-1">/ year</span>
                </div>
                <p className="text-green-400 text-sm font-medium mt-1">
                  2 months free vs monthly
                </p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {['Unlimited AI coaching', 'Workout tracker', 'Session memory', 'Nutrition guidance', 'Cancel anytime'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <span className="text-green-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-4 max-w-xl mx-auto leading-tight">
          Ready to train with a coach that{' '}
          <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            never forgets you?
          </span>
        </h2>
        <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
          Join thousands already training smarter with FitCoach AI. No credit card needed to start.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-10 py-4 rounded-xl text-base transition-colors"
        >
          Get started for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-[10px] font-black text-zinc-950">
              F
            </div>
            <span className="text-sm font-semibold">FitCoach AI</span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4 bg-white/10" />
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/sign-up" className="hover:text-white transition-colors">Get started</Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-zinc-600">© 2026 FitCoach AI</p>
        </div>
      </footer>
    </div>
  );
}
