const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const PropertyListing = require("../models/CreateProperty"); // ✅ use existing model

exports.getListingByPropertyId = asyncHandler(async (req, res) => {
  const propertyId = req.params.propertyId;

  const property = await PropertyListing.findOne({
    "listingInformation.listingInformationPropertyId": propertyId,
  });

  if (!property) {
    throw new ErrorResponse("Property not found", 404);
  }

  res.status(200).json({
    success: true,
    data: property,
  });
});
