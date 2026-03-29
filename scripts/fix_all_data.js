const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fixAllData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = [
            'agent', 'header', 'footer', 'home_page', 'about_page', 
            'contact_page', 'terms_conditions_page', 'privacy_policy_page',
            'testimonials', 'project_banner', 'project_intro', 'project_page'
        ];

        for (const collName of collections) {
            const collection = mongoose.connection.collection(collName);
            const count = await collection.countDocuments();
            console.log(`Checking ${collName} (${count} documents)...`);

            if (count > 0) {
                // Find documents where createdAt is an empty object
                // In MongoDB query, we can check if it's an object and what its shape is
                // But native update with $set is safer to just reset them all to be sure
                
                const result = await collection.updateMany(
                    {
                        $or: [
                            { createdAt: {} },
                            { updatedAt: {} },
                            { createdAt: { $type: "object" }, $expr: { $eq: [{ $size: { $objectToArray: "$createdAt" } }, 0] } },
                            { updatedAt: { $type: "object" }, $expr: { $eq: [{ $size: { $objectToArray: "$updatedAt" } }, 0] } }
                        ]
                    },
                    { 
                        $set: { 
                            createdAt: new Date(), 
                            updatedAt: new Date() 
                        } 
                    }
                );
                console.log(`✅ ${collName}: Reset ${result.modifiedCount} corrupted documents.`);
            }
        }

        await mongoose.connection.close();
        console.log('All done!');
    } catch (error) {
        console.error('Error:', error);
    }
}

fixAllData();
