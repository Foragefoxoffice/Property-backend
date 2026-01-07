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
    // Split names as requested
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: ""
    },
    lastName: {
      type: String,
      trim: true,
      default: ""
    },
    // Keep name for backward compatibility or virtual? 
    // Existing code uses 'name'. I will make 'name' a secondary field or derived.
    // Ideally, I should just populate 'name' on save if it's missing.
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
    // New Fields
    department: {
      type: String,
      default: ""
    },
    designation: {
      type: String,
      default: ""
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
  if (!this.name && this.firstName) {
    this.name = `${this.firstName} ${this.middleName || ''} ${this.lastName || ''}`.replace(/\s+/g, ' ').trim();
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
