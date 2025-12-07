const Queue = require('bull');

// Create a queue instance
// If Redis is on default user/host/port (localhost:6379), no config needed
// However, we wrap it to handle connection issues gracefully in this lab environment
let emailQueue;

try {
    emailQueue = new Queue('email-queue', {
        redis: {
            host: '127.0.0.1',
            port: 6379,
            // Retry strategy to prevent crashing if Redis is down
            retryStrategy: function (times) {
                return Math.min(times * 50, 2000);
            }
        },
        defaultJobOptions: {
            delay: 5000, // Simulate delayed task (5 seconds)
            attempts: 3
        }
    });

    // Consumer (Worker) - Processes jobs from the queue
    emailQueue.process(async (job) => {
        const { email, name } = job.data;
        console.log(`📨 [Worker] Processing email job for: ${email}`);

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`✅ [Worker] Email sent successfully to ${name} <${email}>`);
        console.log(`   Subject: Welcome to Notes API!`);
        return { sent: true };
    });

    // Listen to queue events
    emailQueue.on('completed', (job, result) => {
        console.log(`🎉 [Queue] Job ${job.id} completed!`);
    });

    emailQueue.on('failed', (job, err) => {
        console.log(`❌ [Queue] Job ${job.id} failed: ${err.message}`);
    });

    emailQueue.on('error', (err) => {
        console.log('⚠️ [Queue Error] Redis connection issues likely:', err.message);
    });

    console.log('📬 Email Queue Service Initialized');

} catch (error) {
    console.log('⚠️ Failed to initialize Bull Queue:', error.message);
}

// Wrapper to add jobs safely
const addEmailJob = async (data) => {
    if (!emailQueue) return;
    try {
        const job = await emailQueue.add(data);
        console.log(`📥 [Producer] Job added to queue: ID ${job.id} (Email to ${data.email})`);
        return job;
    } catch (error) {
        console.error('Failed to add job to queue:', error.message);
    }
};

module.exports = {
    emailQueue,
    addEmailJob
};
