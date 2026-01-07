const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
    {
        agentImage: {
            type: String,
            trim: true,
            default: ''
        },
        agentNumber: {
            type: [String],
            default: []
        },
        agentEmail: {
            type: [String],
            default: []
        },
        agentZaloLink: {
            type: String,
            trim: true,
            default: ''
        },
        agentMessengerLink: {
            type: String,
            trim: true,
            default: ''
        },
        agentWhatsappLink: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true,
        collection: 'agent'
    }
);

module.exports = mongoose.model('Agent', agentSchema);
