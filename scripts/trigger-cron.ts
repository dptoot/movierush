// scripts/trigger-cron.ts
// Manual trigger for testing the cron job locally
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = process.env.CRON_TEST_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

async function triggerCron() {
  console.log('\n🧪 Triggering cron job manually...\n');
  console.log('━'.repeat(50));

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET not found in environment variables');
    console.error('   Make sure .env.local contains CRON_SECRET');
    process.exit(1);
  }

  const url = `${BASE_URL}/api/cron/generate-challenge`;
  console.log(`📡 URL: ${url}`);
  console.log(`🔑 Using CRON_SECRET from .env.local`);

  try {
    console.log('\n⏳ Sending request...\n');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log(`📦 Response:`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Cron job completed successfully!');
      if (data.challengeId) {
        console.log(`\n📋 Challenge Details:`);
        console.log(`   Date: ${data.date}`);
        console.log(`   Actor: ${data.actor}`);
        console.log(`   Challenge ID: ${data.challengeId}`);
        console.log(`   Movies: ${data.movieCount}`);
      } else if (data.message === 'Challenge already exists') {
        console.log(`\n📋 Challenge for ${data.date} already exists (no duplicate created)`);
      }
    } else {
      console.log('\n❌ Cron job failed');
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error instanceof Error ? error.message : error);
    console.error('\n💡 Make sure the dev server is running: npm run dev');
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(50) + '\n');
}

triggerCron();
