import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json().catch(() => ({ plan: 'monthly' }));
  const priceId =
    plan === 'annual'
      ? process.env.STRIPE_PRICE_ID_ANNUAL!
      : process.env.STRIPE_PRICE_ID_MONTHLY!;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const metadata = user.publicMetadata as Record<string, unknown>;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: metadata.stripeCustomerId as string | undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/app?subscribed=1`,
    cancel_url: `${baseUrl}/subscribe`,
    metadata: { clerkUserId: userId },
  });

  return NextResponse.json({ url: session.url });
}
