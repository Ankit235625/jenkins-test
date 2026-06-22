require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./server/models/Client');

async function checkAbhishek() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const abhishek = await Client.findOne({ name: /Abhishek/ });
    if (!abhishek) {
        console.log('Abhishek not found by name.');
    } else {
        console.log('--- CLIENT DATA: ABHISHEK ---');
        console.log(JSON.stringify(abhishek, null, 2));
        console.log('Phone Type:', typeof abhishek.phone);
        console.log('Name Type:', typeof abhishek.name);
        console.log('----------------------------');
    }

    await mongoose.connection.close();
    process.exit(0);
}

checkAbhishek();
