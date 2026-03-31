const mongoose = require('mongoose');
require('dotenv').config();
const CreateProperty = require('../models/CreateProperty');

async function listProps() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await CreateProperty.countDocuments();
    console.log(`Total CreateProperty found: ${count}`);
    const props = await CreateProperty.find().limit(5);
    console.log('Sample IDs:', props.map(p => p.listingInformation?.listingInformationPropertyId));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listProps();
