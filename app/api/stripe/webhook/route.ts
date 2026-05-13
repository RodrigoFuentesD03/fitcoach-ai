import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const clerk = await clerkClient();

  async function updateStatus(customerId: string, status: string) {
    const customers = await stripe.customers.list({ limit: 1 });
    // Get clerkUserId from Stripe customer metadata
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const clerkUserId = customer.metadata?.clerkUserId;
    if (!clerkUserId) return;

    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { subscriptionStatus: status },
    });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession;
      if (session.mode === 'subscription' && session.customer) {
        await updateStatus(session.customer as string, 'active');
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await updateStatus(sub.customer as string, 'cancelled');
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await updateStatus(invoice.customer as string, 'expired');
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
