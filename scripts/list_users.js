const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, 'email role name');
    console.log('--- USERS ---');
    console.log(users);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listUsers();
