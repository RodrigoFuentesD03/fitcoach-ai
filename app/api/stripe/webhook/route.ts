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

  async function updateStatusByCustomer(customerId: string, status: string) {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const clerkUserId = customer.metadata?.clerkUserId;
    if (!clerkUserId) return;
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { subscriptionStatus: status },
    });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;
      // Prefer clerkUserId from session metadata (set in checkout/route.ts)
      const clerkUserId = session.metadata?.clerkUserId;
      if (clerkUserId) {
        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { subscriptionStatus: 'active' },
        });
      } else if (session.customer) {
        // Fallback: look it up from the Stripe customer record
        await updateStatusByCustomer(session.customer as string, 'active');
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await updateStatusByCustomer(sub.customer as string, 'cancelled');
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await updateStatusByCustomer(invoice.customer as string, 'expired');
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
