const mongoose = require('mongoose');
require('dotenv').config();
const Staff = require('../models/Staff');

async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const newPassword = '183solution@#2k26';

    const staff = await Staff.findOne({ staffsEmail: email });
    if (!staff) {
      console.log(`Staff with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`Updating password for staff: ${staff.staffsName.en} (${staff.staffsId})`);
    staff.password = newPassword;
    await staff.save();

    console.log('Password updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
}

updatePassword();
