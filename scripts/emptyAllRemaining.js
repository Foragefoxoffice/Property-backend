const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

async function emptyAllRemaining() {
  try {
    await connectDB();
    console.log('Connected to MongoDB via shared config');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let totalDeleted = 0;

    const collectionsToClear = [
      'projectcategories',
      'projectenquiries',
      'categories',
      'blogs',
      'subscriptions',
      'favorites', // Added as it was also in counts
      'staffs',    // Clearing some more based on previous turned counts if useful? No, stick to what's in screenshots.
    ];

    for (const collName of collectionsToClear) {
      if (collectionNames.includes(collName)) {
        const result = await mongoose.connection.db.collection(collName).deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from '${collName}' collection.`);
        totalDeleted += result.deletedCount;
      }
    }

    console.log(`Database empty operation completed. Total deleted: ${totalDeleted}`);
    process.exit(0);
  } catch (err) {
    console.error('Error in emptyAllRemaining script:', err);
    process.exit(1);
  }
}

emptyAllRemaining();
