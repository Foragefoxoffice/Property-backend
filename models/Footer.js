const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema(
    {
        footerLogo: {
            type: String,
            trim: true,
            default: ''
        },
        footerEmail: {
            type: String,
            trim: true,
            default: ''
        },
        footerNumber: {
            type: [String],
            default: []
        },
        footerIcons: [
            {
                icon: { type: String, required: true },
                link: { type: String, required: true }
            }
        ],
        // English Fields
        footerAddressLable_en: { type: String, default: '' },
        footerAddress_en: { type: String, default: '' },
        footerNumberLable_en: { type: String, default: '' },
        footerEmailLable_en: { type: String, default: '' },
        footerOurCompanyLable_en: { type: String, default: '' },
        footerQuickLinksLable_en: { type: String, default: '' },
        footerJoinOurNewsTitle_en: { type: String, default: '' },
        footerJoinOurNewsDescription_en: { type: String, default: '' },

        // Vietnamese Fields
        footerAddressLable_vn: { type: String, default: '' },
        footerAddress_vn: { type: String, default: '' },
        footerNumberLable_vn: { type: String, default: '' },
        footerEmailLable_vn: { type: String, default: '' },
        footerOurCompanyLable_vn: { type: String, default: '' },
        footerQuickLinksLable_vn: { type: String, default: '' },
        footerJoinOurNewsTitle_vn: { type: String, default: '' },
        footerJoinOurNewsDescription_vn: { type: String, default: '' }
    },
    {
        timestamps: true,
        collection: 'footer'
    }
);

module.exports = mongoose.model('Footer', footerSchema);
