import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

function hasAccess(metadata: Record<string, unknown>): boolean {
  if (metadata.subscriptionStatus === 'active') return true;
  if (metadata.trialStartDate) {
    const days =
      (Date.now() - new Date(metadata.trialStartDate as string).getTime()) / 86_400_000;
    return days < 7;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (!hasAccess(user.publicMetadata as Record<string, unknown>)) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const { message, sessionId } = await req.json();

  const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sendMessage',
      sessionId,
      chatInput: message,
    }),
  });

  const data = await n8nRes.json();
  return NextResponse.json({ reply: data.output ?? 'No response from coach.' });
}
