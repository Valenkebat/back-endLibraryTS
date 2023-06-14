import cron from 'node-cron'
import { sendMail } from '../admin/admin';

///////////////////////////////////////////////////// CRON JOB /////////////////////////////////////////////////////////////////////////////////
// "0 0 * * 7" -> Una vez por semana
export const job: cron.ScheduledTask = cron.schedule("* * * * *", () => {
    sendMail()
    console.log("Message sent: %s");
    console.log(new Date().toLocaleString());
    console.log('Hola Desde el cron')
}, {
    scheduled: true,
    timezone: "America/Buenos_Aires",
    runOnInit: false,
});