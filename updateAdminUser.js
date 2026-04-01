require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const updateAdminCredentials = async () => {
    try {
        const uri = process.env.MONGODB_URI.replace('127.0.0.1', 'localhost');
        await mongoose.connect(uri);
        console.log(`✅ Connected to MongoDB at ${uri}`);

        const oldEmail = 'admin@gmail.com';
        const newEmail = 'superadmin@183housingsolutions.com';
        const newPassword = 'Superadmin@123';

        // Find the staff member
        const staff = await Staff.findOne({ staffsEmail: oldEmail });

        if (!staff) {
            console.error(`❌ Staff member with email ${oldEmail} not found.`);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log(`Found staff member: ${staff.staffsName.en} (${staff.staffsEmail})`);

        // Update fields
        staff.staffsEmail = newEmail;
        staff.password = newPassword;

        // Save the document (this will trigger the password hashing hook)
        await staff.save();

        console.log('✅ Admin credentials updated successfully.');
        console.log(`New Email: ${newEmail}`);
        console.log(`New Password: ${newPassword} (Stored as hash)`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin credentials:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

updateAdminCredentials();
