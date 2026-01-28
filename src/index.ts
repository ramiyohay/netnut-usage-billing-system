import { app } from "./app";
import { startBillingCron } from "./cron/billing.cron";

const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;

console.log(`Starting server in ${env} mode on port ${port}`);

if (env !== "test") startBillingCron(); // Start the billing cron job 

app.listen(port);
