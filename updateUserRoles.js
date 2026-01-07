/**
 * Migration Script: Update Existing Users with Admin Role
 * 
 * This script updates all existing users in the database to have role='admin'
 * Run this once after deploying the role-based access control feature
 * 
 * Usage: node updateUserRoles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Update all users without a role to be admin
        const result = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'admin' } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users to admin role`);

        // Also update users with null or empty role
        const result2 = await User.updateMany(
            { $or: [{ role: null }, { role: '' }] },
            { $set: { role: 'admin' } }
        );

        console.log(`✅ Updated ${result2.modifiedCount} additional users to admin role`);

        // Show all users with their roles
        const users = await User.find({}, 'name email role employeeId');
        console.log('\n📋 Current Users:');
        users.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.employeeId}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating user roles:', error);
        process.exit(1);
    }
};

updateUserRoles();
