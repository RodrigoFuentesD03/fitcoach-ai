import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const metadata = user.publicMetadata as Record<string, unknown>;

  // Already initialized — nothing to do
  if (metadata.trialStartDate) {
    return NextResponse.json({ ok: true });
  }

  // Create a Stripe customer linked to this user
  const customer = await stripe.customers.create({
    email: user.emailAddresses[0]?.emailAddress,
    metadata: { clerkUserId: userId },
  });

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      trialStartDate: new Date().toISOString(),
      stripeCustomerId: customer.id,
      subscriptionStatus: 'trial',
    },
  });

  return NextResponse.json({ ok: true });
}
