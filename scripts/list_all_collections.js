const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

async function listAll() {
  try {
    await connectDB();
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('--- ALL COLLECTIONS ---');
    console.log(collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listAll();
