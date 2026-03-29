const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function checkTotalAgents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.collection('agent');
        const count = await collection.countDocuments();
        console.log('TOTAL AGENTS IN DB:', count);
        
        const allAgents = await collection.find({}).toArray();
        allAgents.forEach((a, i) => {
            console.log(`Agent ${i}: ID=${a._id}, createdAt=${JSON.stringify(a.createdAt)}, updatedAt=${JSON.stringify(a.updatedAt)}`);
            console.log(`Types: createdAt=${typeof a.createdAt}, updatedAt=${typeof a.updatedAt}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTotalAgents();
