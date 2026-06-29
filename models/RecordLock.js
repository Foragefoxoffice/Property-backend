const mongoose = require("mongoose");

const RecordLockSchema = new mongoose.Schema({
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'lockedByModel'
  },
  lockedByModel: {
    type: String,
    required: true,
    enum: ['User', 'Staff']
  },
  lockedAt: {
    type: Date,
    default: Date.now,
  }
});

// Create a compound index for fast lookups
RecordLockSchema.index({ recordId: 1, collectionName: 1 }, { unique: true });

// TTL index: automatically expire locks after 15 minutes (900 seconds)
RecordLockSchema.index({ lockedAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model("RecordLock", RecordLockSchema);
