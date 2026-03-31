const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'superadminhousingsolution@gmail.com';
    const password = 'Admin123@$$$';
    const role = 'Super Admin';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to ${role}.`);
      existingUser.role = role;
      await existingUser.save();
      console.log('User updated successfully.');
      process.exit(0);
    }

    const newUser = new User({
      email,
      password,
      role,
      name: 'Super Admin',
      firstName: { en: 'Super', vi: 'Siêu' },
      lastName: { en: 'Admin', vi: 'Quản quản' },
      status: 'Active',
      isVerified: true
    });

    await newUser.save();
    console.log(`Super Admin user ${email} created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating super admin:', err);
    process.exit(1);
  }
}

createSuperAdmin();
