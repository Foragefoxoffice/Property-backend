const mongoose = require('mongoose');

const permissionSchema = {
    hide: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
    copy: { type: Boolean, default: false }
};

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a role name'],
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    permissions: {
        properties: {
            lease: permissionSchema,
            sale: permissionSchema,
            homestay: permissionSchema
        },
        cms: {
            homePage: permissionSchema,
            aboutUs: permissionSchema,
            contactUs: permissionSchema,
            header: permissionSchema,
            footer: permissionSchema,
            agent: permissionSchema // Property Consultet
        },
        blogs: {
            category: permissionSchema,
            blogCms: permissionSchema
        },
        userManagement: {
            userDetails: permissionSchema,
            enquires: permissionSchema
        },
        menuStaffs: { // Renamed to menuStaffs to avoid conflict with 'staffs' sub-module
            roles: permissionSchema,
            staffs: permissionSchema
        },
        landlords: permissionSchema
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
