const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const FloorRange = require("../models/FloorRange");
const CreateProperty = require("../models/CreateProperty");

// ✅ Get All
exports.getFloorRanges = asyncHandler(async (req, res) => {
  const floorRanges = await FloorRange.aggregate([
    { $addFields: { numericCode: { $toInt: "$code.en" } } },
    { $sort: { numericCode: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: floorRanges
  });
});


// ✅ Create
exports.createFloorRange = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("English & Vietnamese names are required", 400);
  }

  // ❌ Prevent duplicate name
  const existing = await FloorRange.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existing) {
    throw new ErrorResponse("Floor Range with this name already exists", 400);
  }

  // Generate next auto code
  const allRanges = await FloorRange.find({}, { "code.en": 1 }).lean();

  const numericCodes = allRanges
    .map(r => parseInt(r.code?.en))
    .filter(n => !isNaN(n));

  let next = 1;
  if (numericCodes.length > 0) {
    next = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(next).padStart(3, "0");

  const created = await FloorRange.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Floor Range created",
    data: created
  });
});

// ✅ Update
exports.updateFloorRange = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const entry = await FloorRange.findById(req.params.id);
  if (!entry) throw new ErrorResponse("Floor Range not found", 404);

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicate = await FloorRange.findOne({
      _id: { $ne: entry._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || entry.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || entry.name.vi}$`, "i") } }
      ]
    });

    if (duplicate) {
      throw new ErrorResponse("Floor Range with this name already exists", 400);
    }
  }

  entry.code.en = code_en ?? entry.code.en;
  entry.code.vi = code_vi ?? entry.code.vi;
  entry.name.en = name_en ?? entry.name.en;
  entry.name.vi = name_vi ?? entry.name.vi;
  entry.status = status ?? entry.status;

  await entry.save();

  res.status(200).json({
    success: true,
    message: "Floor Range updated successfully",
    data: entry,
  });
});


// ✅ Delete
exports.deleteFloorRange = asyncHandler(async (req, res) => {
  const entry = await FloorRange.findById(req.params.id);
  if (!entry) throw new ErrorResponse("Floor Range not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "propertyInformation.informationFloors": entry.name.en },
      { "propertyInformation.informationFloors": entry.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await entry.deleteOne();

  res.status(200).json({
    success: true,
    message: "Floor Range deleted successfully",
  });
});
