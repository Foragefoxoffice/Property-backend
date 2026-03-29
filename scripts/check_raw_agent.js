const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function checkRawAgent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.collection('agent');
        const agents = await collection.find().toArray();
        console.log('RAW AGENTS IN DB:');
        console.log(JSON.stringify(agents, null, 2));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRawAgent();
