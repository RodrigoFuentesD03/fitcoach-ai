import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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
