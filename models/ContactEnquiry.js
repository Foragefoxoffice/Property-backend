const mongoose = require("mongoose");

const contactEnquirySchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "Please add a first name"],
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: [true, "Please add a last name"],
            trim: true,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        phone: {
            type: String,
            required: [true, "Please add a phone number"],
            maxlength: 20,
        },
        subject: {
            type: String,
            required: [true, "Please select a subject"],
            enum: ["General Inquiry", "Property Viewing", "Partnership", "Support", "Other"],
        },
        message: {
            type: String,
            required: [true, "Please add a message"],
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ContactEnquiry", contactEnquirySchema);
