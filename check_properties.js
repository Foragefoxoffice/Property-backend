const mongoose = require("mongoose");
require("dotenv").config();

async function checkProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const CreateProperty = mongoose.model("CreateProperty", new mongoose.Schema({}, { strict: false }));
    const leaseProperties = await CreateProperty.find({
      "listingInformation.listingInformationTransactionType.en": "Lease"
    }).limit(5).lean();

    console.log(`Found ${leaseProperties.length} Lease properties`);
    leaseProperties.forEach((p, idx) => {
      console.log(`\nProperty ${idx + 1}:`);
      console.log("ID:", p.listingInformation?.listingInformationPropertyId);
      console.log("Financial Details:", JSON.stringify(p.financialDetails, null, 2));
      console.log("Financial Visibility:", JSON.stringify(p.financialVisibility, null, 2));
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkProperties();
