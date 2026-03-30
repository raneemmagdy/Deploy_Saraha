import cron from "node-cron";
export const deleteUnconfirmedUser = () => {
    cron.schedule('*/30 * * * * *', async () => {
        console.log('running a task every minute🔴🎈');
    });
}