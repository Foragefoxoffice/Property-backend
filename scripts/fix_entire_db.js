const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fixEntireDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collNames = collections.map(c => c.name);

        console.log(`Checking ${collNames.length} collections...`);

        for (const collName of collNames) {
            if (collName.startsWith('system.')) continue;
            
            const collection = mongoose.connection.collection(collName);
            
            // Find ALL documents. For each, check if createdAt/updatedAt are empty objects
            // This is safer than complex queries.
            const cursor = collection.find({
                $or: [
                    { createdAt: { $exists: true } },
                    { updatedAt: { $exists: true } }
                ]
            });

            let fixedCount = 0;
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                let needsFix = false;

                const isInvalid = (val) => {
                    if (val === null || val === undefined) return false;
                    // Check if it's an empty object {} or an object that is NOT a Date
                    return (
                        val.constructor === Object && 
                        Object.keys(val).length === 0
                    ) || (
                        typeof val === 'object' && 
                        !(val instanceof Date) && 
                        Object.keys(val).length === 0
                    );
                };

                if (isInvalid(doc.createdAt) || isInvalid(doc.updatedAt)) {
                    needsFix = true;
                }

                if (needsFix) {
                    await collection.updateOne(
                        { _id: doc._id },
                        { 
                            $set: { 
                                createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(), 
                                updatedAt: new Date() 
                            } 
                        }
                    );
                    fixedCount++;
                }
            }
            
            if (fixedCount > 0) {
                console.log(`✅ Fixed ${fixedCount} documents in "${collName}".`);
            }
        }

        await mongoose.connection.close();
        console.log('Database repair complete! 🚀');
    } catch (error) {
        console.error('Error:', error);
    }
}

fixEntireDb();
