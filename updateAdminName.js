require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const updateAdminName = async () => {
    try {
        const uri = process.env.MONGODB_URI.replace('127.0.0.1', 'localhost');
        await mongoose.connect(uri);
        console.log(`✅ Connected to MongoDB at ${uri}`);

        const currentEmail = 'superadmin@183housingsolutions.com';
        const newName = 'Super Admin';

        // Find the staff member
        const staff = await Staff.findOne({ staffsEmail: currentEmail });

        if (!staff) {
            console.error(`❌ Staff member with email ${currentEmail} not found.`);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log(`Found staff member: ${staff.staffsName.en} (${staff.staffsEmail})`);

        // Update name
        staff.staffsName = {
            en: newName,
            vi: newName // Assuming same name for Vietnamese or user just wants it changed
        };

        // Save the document
        await staff.save();

        console.log('✅ Admin name updated successfully.');
        console.log(`New Name: ${newName}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin name:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

updateAdminName();
