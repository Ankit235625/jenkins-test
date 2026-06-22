const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const MessageLog = require('./server/models/MessageLog');
const Message = require('./server/models/Message');
const Client = require('./server/models/Client');
const Template = require('./server/models/Template');
const Automation = require('./server/models/Automation');

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const [totalClients, totalTemplates, totalAutomations, totalOptOuts] = await Promise.all([
            Client.countDocuments(),
            Template.countDocuments(),
            Automation.countDocuments(),
            Client.countDocuments({ status: 'Inactive' })
        ]);

        const [bulkStatuses, individualStatuses] = await Promise.all([
            MessageLog.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Message.aggregate([
                { $match: { sender: { $in: ['admin', 'assistant'] } } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ])
        ]);

        console.log('Bulk Statuses:', bulkStatuses);
        console.log('Individual Statuses:', individualStatuses);

        const statusMap = {};
        bulkStatuses.forEach(s => { statusMap[s._id] = (statusMap[s._id] || 0) + s.count; });
        individualStatuses.forEach(s => { statusMap[s._id] = (statusMap[s._id] || 0) + s.count; });

        const delivered = (statusMap['delivered'] || 0) + (statusMap['read'] || 0) + (statusMap['sent'] || 0);
        const read = statusMap['read'] || 0;
        const failed = statusMap['failed'] || 0;
        const queued = (statusMap['queued'] || 0) + (statusMap['pending'] || 0);
        const totalAttempts = delivered + failed + queued;

        const totalMessages = delivered;

        const deliveredPercentage = totalAttempts > 0 ? Math.round((delivered / totalAttempts) * 100) : 0;
        const readPercentage = delivered > 0 ? Math.round((read / delivered) * 100) : 0;
        const failedPercentage = totalAttempts > 0 ? Math.round((failed / totalAttempts) * 100) : 0;

        console.log('--- Stats Result ---');
        console.log('Total Clients:', totalClients);
        console.log('Total Messages (Delivered/Sent):', totalMessages);
        console.log('Delivered Rate:', deliveredPercentage + '%');
        console.log('Read Rate:', readPercentage + '%');
        console.log('Failed Rate:', failedPercentage + '%');
        console.log('--------------------');

        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
}

testStats();
