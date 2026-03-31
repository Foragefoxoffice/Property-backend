const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

async function emptyProperties() {
  try {
    console.log('Using MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'MISSING');
    await connectDB();
    console.log('Connected to MongoDB via shared config');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections in DB:', collectionNames);

    let totalDeleted = 0;

    if (collectionNames.includes('createproperties')) {
      const result = await mongoose.connection.db.collection('createproperties').deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from 'createproperties' collection.`);
      totalDeleted += result.deletedCount;
    }

    if (collectionNames.includes('properties')) {
      const result = await mongoose.connection.db.collection('properties').deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from 'properties' collection.`);
      totalDeleted += result.deletedCount;
    }

    // Also check for 'create-properties' just in case of different pluralization
    if (collectionNames.includes('create-properties')) {
      const result = await mongoose.connection.db.collection('create-properties').deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from 'create-properties' collection.`);
      totalDeleted += result.deletedCount;
    }

    console.log(`Database empty operation completed. Total deleted: ${totalDeleted}`);
    process.exit(0);
  } catch (err) {
    console.error('Error in emptyProperties script:', err);
    process.exit(1);
  }
}

emptyProperties();
