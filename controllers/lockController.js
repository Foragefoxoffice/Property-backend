const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const RecordLock = require("../models/RecordLock");

// @desc    Acquire a lock for a record
// @route   POST /api/v1/locks/acquire
// @access  Private
exports.acquireLock = asyncHandler(async (req, res, next) => {
  const { recordId, collectionName } = req.body;
  if (!recordId || !collectionName) {
    return next(new ErrorResponse("Please provide recordId and collectionName", 400));
  }

  const userId = req.user._id;
  // If req.user is Staff, the model is Staff. If User, it's User. 
  // Wait, in middleware/auth.js, staff roles might just be 'admin' or 'staff'.
  // We can determine model by checking if req.user has staffsEmail (Staff specific field)
  const lockedByModel = req.user.staffsEmail ? 'Staff' : 'User';

  // Check if a lock already exists
  let lock = await RecordLock.findOne({ recordId, collectionName }).populate("lockedBy");

  if (lock) {
    // If it's already locked by the SAME user, just update the timestamp
    if (lock.lockedBy._id.toString() === userId.toString()) {
      lock.lockedAt = Date.now();
      await lock.save();
      return res.status(200).json({ success: true, message: "Lock renewed", data: lock });
    }

    // Locked by someone else
    const lockedByName = lock.lockedBy.name || lock.lockedBy.staffsName?.en || lock.lockedBy.firstName?.en || "Another user";
    const message = (req.headers["accept-language"] === "vi")
      ? `Bản ghi này đang được chỉnh sửa bởi ${lockedByName}. Bạn không thể sửa lúc này.`
      : `This record is currently being edited by ${lockedByName}. You cannot edit it right now.`;
    
    return res.status(409).json({ success: false, message, lockedByName });
  }

  // Create new lock
  lock = await RecordLock.create({
    recordId,
    collectionName,
    lockedBy: userId,
    lockedByModel,
  });

  res.status(201).json({ success: true, data: lock });
});

// @desc    Release a lock for a record
// @route   POST /api/v1/locks/release
// @access  Private
exports.releaseLock = asyncHandler(async (req, res, next) => {
  const { recordId, collectionName } = req.body;
  if (!recordId || !collectionName) {
    return next(new ErrorResponse("Please provide recordId and collectionName", 400));
  }

  const userId = req.user._id;

  // Find and delete the lock ONLY if it belongs to the current user
  const lock = await RecordLock.findOneAndDelete({
    recordId,
    collectionName,
    lockedBy: userId
  });

  if (!lock) {
    return res.status(404).json({ success: false, message: "Lock not found or you don't have permission to release it" });
  }

  res.status(200).json({ success: true, message: "Lock released successfully" });
});

// @desc    Heartbeat to keep lock alive
// @route   POST /api/v1/locks/heartbeat
// @access  Private
exports.heartbeatLock = asyncHandler(async (req, res, next) => {
  const { recordId, collectionName } = req.body;
  
  const lock = await RecordLock.findOneAndUpdate(
    { recordId, collectionName, lockedBy: req.user._id },
    { lockedAt: Date.now() },
    { new: true }
  );

  if (!lock) {
    return res.status(404).json({ success: false, message: "Lock expired or not found" });
  }

  res.status(200).json({ success: true, data: lock });
});
