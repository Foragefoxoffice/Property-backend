const mongoose = require('mongoose');
require('dotenv').config();

async function listDbs() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const admin = new mongoose.mongo.Admin(conn.connection.db);
    const dbs = await admin.listDatabases();
    console.log('--- ALL DATABASES ---');
    console.log(dbs.databases.map(d => d.name));
    process.exit(0);
  } catch (err) {
    console.error('Error listing databases (likely no permission):', err.message);
    process.exit(1);
  }
}

listDbs();
