const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('COLLECTIONS IN DB:');
        console.log(collections.map(c => c.name));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

listCollections();
