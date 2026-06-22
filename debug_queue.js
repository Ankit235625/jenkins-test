require('dotenv').config();
const { Queue } = require('bullmq');
const { connection } = require('d:/fasc-work/projects/TEST/WHATSAPP/whatsapp/server/queue');
const mongoose = require('mongoose');
const MessageLog = require('d:/fasc-work/projects/TEST/WHATSAPP/whatsapp/server/models/MessageLog');
const Client = require('d:/fasc-work/projects/TEST/WHATSAPP/whatsapp/server/models/Client');

async function debugQueue() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const queue = new Queue('whatsapp-queue', { connection });
    
    console.log('--- QUEUE STATUS ---');
    const counts = await queue.getJobCounts();
    console.log('Job Counts:', JSON.stringify(counts, null, 2));

    const activeJobs = await queue.getActive();
    console.log(`\nActive Jobs (${activeJobs.length}):`);
    activeJobs.forEach(job => {
        console.log(`- ID: ${job.id}, Name: ${job.name}, Data: ${JSON.stringify(job.data)}`);
    });

    const waitingJobs = await queue.getWaiting();
    console.log(`\nWaiting Jobs (${waitingJobs.length}):`);
    waitingJobs.forEach(job => {
        console.log(`- ID: ${job.id}, Name: ${job.name}, Data: ${JSON.stringify(job.data)}`);
    });

    console.log('\n--- MESSAGE LOGS (QUEUED) ---');
    const queuedLogs = await MessageLog.find({ status: 'queued' }).populate('client').limit(5);
    queuedLogs.forEach(log => {
        console.log(`- ID: ${log._id}, Client: ${log.client?.name} (${log.client?.phone}), CreatedAt: ${log.createdAt}`);
    });

    await queue.close();
    await mongoose.connection.close();
    process.exit(0);
}

debugQueue();
