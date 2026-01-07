const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: [true, "Please provide an Employee ID"],
      trim: true,
    },
    // Bilingual name fields
    firstName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    middleName: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    lastName: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    // Keep name for backward compatibility
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      // Removed enum to allow dynamic roles from Role collection
      default: 'user',
    },
    // Bilingual department and designation fields
    department: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    designation: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    joiningDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

/* Pre-save hook to populate 'name' from parts if missing */
userSchema.pre("save", async function (next) {
  if (!this.name && this.firstName?.en) {
    this.name = `${this.firstName.en} ${this.middleName?.en || ''} ${this.lastName?.en || ''}`.replace(/\s+/g, ' ').trim();
  }

  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* Compare password */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* Generate JWT */
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

module.exports = mongoose.model("User", userSchema);
