const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const Agent = require('../models/Agent');

async function checkAgent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property');
        console.log('Connected to MongoDB');

        const agents = await Agent.find();
        console.log('Agents found:', agents.length);

        for (const agent of agents) {
            console.log('Agent ID:', agent._id);
            console.log('createdAt:', agent.createdAt);
            console.log('updatedAt:', agent.updatedAt);
            
            // Check if they are invalid
            if (agent.createdAt && typeof agent.createdAt === 'object' && Object.keys(agent.createdAt).length === 0) {
                console.log('⚠️ Corrupted createdAt found!');
            }
        }

        if (agents.length > 0) {
            console.log('Cleaning up first agent...');
            const firstAgent = agents[0];
            
            // Fix the corrupted fields
            await Agent.collection.updateOne(
                { _id: firstAgent._id },
                { 
                    $set: { 
                        createdAt: new Date(), 
                        updatedAt: new Date() 
                    } 
                }
            );
            console.log('✅ Agent cleaned up via native collection update');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkAgent();
