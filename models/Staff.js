const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StaffSchema = new mongoose.Schema(
  {
    staffsImage: {
      type: String,
      default: null,
    },

    staffsName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },

    staffsEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    staffsId: {
      type: String,
      unique: true,
      trim: true,
    },

    staffsRole: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },

    /** ✅ Multiple Phone Numbers */
    staffsNumbers: {
      type: [String],
      default: [],
    },

    /** ✅ Gender */
    staffsGender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    staffsNotes: {
      en: { type: String, trim: true },
      vi: { type: String, trim: true },
    },

    // ✅ New Fields for extended functionality
    staffsDepartment: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    staffsDesignation: {
      en: { type: String, trim: true, default: "" },
      vi: { type: String, trim: true, default: "" },
    },
    staffsDob: {
      type: Date,
    },
    staffsJoiningDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Auth fields
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypt password using bcrypt and auto-generate staffsId
StaffSchema.pre("save", async function (next) {
  // Auto-generate staffsId if not provided
  if (!this.staffsId) {
    const count = await mongoose.model('Staff').countDocuments();
    const nextNumber = (count + 1).toString().padStart(6, '0');
    this.staffsId = `STF-${nextNumber}`;
  }

  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
StaffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
StaffSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'staff' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

module.exports = mongoose.model("Staff", StaffSchema);
