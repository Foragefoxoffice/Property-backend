const mongoose = require('mongoose');
require('dotenv').config();
const Staff = require('./models/Staff');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/property');
    const staff = await Staff.findOne({ staffsEmail: 'actewpdeveloper1@gmail.com' });
    console.log('Staff found:', staff ? 'Yes' : 'No');
    if (staff) {
        console.log('OTP:', staff.resetPasswordToken);
        console.log('Expiry:', staff.resetPasswordExpire);
    }
    process.exit();
}

check();
