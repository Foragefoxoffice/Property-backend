const mongoose = require("mongoose");

const projectEnquirySchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Please add a full name"],
            trim: true,
            maxlength: 100,
        },
        phone: {
            type: String,
            required: [true, "Please add a phone number"],
            maxlength: 20,
        },
        message: {
            type: String,
            maxlength: 1000,
        },
        projectName: {
            type: String,
            required: [true, "Project name is required"],
        },
        projectId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Project',
            // required: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectEnquiry", projectEnquirySchema);
