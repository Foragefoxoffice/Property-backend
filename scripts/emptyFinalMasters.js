const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

async function emptyFinalMasters() {
  try {
    await connectDB();
    console.log('Connected to MongoDB via shared config');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let totalDeleted = 0;

    // 1. Clear Users except the new super admin
    const superAdminEmail = 'superadminhousingsolution@gmail.com';
    const userResult = await mongoose.connection.db.collection('users').deleteMany({
      email: { $ne: superAdminEmail }
    });
    console.log(`Deleted ${userResult.deletedCount} documents from 'users' collection (kept ${superAdminEmail}).`);
    totalDeleted += userResult.deletedCount;

    // 2. Clear other requested collections
    const collectionsToClear = [
      'contactenquiries',
      'testimonials',
      'owners',
      'availabilitystatuses',
      'furnishings',
      'feetaxes',
      'zonesubareas',
      'floorranges',
      'units',
      'blocks',
      'payments',
      'propertytypes',
      'legaldocuments',
      'propertylisting',
      'projectcommunities', // Just in case
      'currencies',
      'notificationsettings',
      'chat'
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
    console.error('Error in emptyFinalMasters script:', err);
    process.exit(1);
  }
}

emptyFinalMasters();
