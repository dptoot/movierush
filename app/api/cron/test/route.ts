// app/api/cron/test/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('🧪 Test cron job triggered');
  console.log(`📅 Current time: ${new Date().toISOString()}`);

  // Security check: Verify authorization header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET environment variable not set');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized request');
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('✅ Test cron executed successfully!');
  console.log(`🔢 Random number: ${Math.floor(Math.random() * 1000)}`);

  return NextResponse.json({
    success: true,
    message: 'Test cron executed',
    timestamp: new Date().toISOString(),
  });
}
