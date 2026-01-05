const mongoose = require('mongoose');

const headerSchema = new mongoose.Schema(
    {
        headerLogo: {
            type: String,
            trim: true,
            default: '/images/login/logo.png'
        }
    },
    {
        timestamps: true,
        collection: 'header'
    }
);

module.exports = mongoose.model('Header', headerSchema);
