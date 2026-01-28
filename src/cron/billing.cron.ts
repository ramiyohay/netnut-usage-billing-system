import cron from 'node-cron';
import { runBillingCycle } from '../services/billing.service';

const CRON_SCHEDULE = '* * * * *'; // Every minute

// Start the billing cron job , every minute
export function startBillingCron() {
  console.log('Starting billing cron job');

  cron.schedule(CRON_SCHEDULE, async () => {
    await runBillingCycle(); // Run the billing cycle
  });

  console.log('cron job started');
}
