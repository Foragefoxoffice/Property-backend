/**
 * Migration: Strip domain prefix from image URLs in all collections
 * Converts "https://domain.com/uploads/..." → "/uploads/..."
 *
 * Run: node scripts/stripImageDomains.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

// Regex matches any http/https domain prefix before /uploads/
const DOMAIN_REGEX = /^https?:\/\/[^/]+(\/.*)$/;

function stripDomain(value) {
  if (typeof value !== "string") return value;
  const match = value.match(DOMAIN_REGEX);
  return match ? match[1] : value;
}

function stripFromObject(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && val.startsWith("http") && val.includes("/uploads/")) {
      obj[key] = stripDomain(val);
    } else if (Array.isArray(val)) {
      obj[key] = val.map((item) =>
        typeof item === "string" && item.startsWith("http") && item.includes("/uploads/")
          ? stripDomain(item)
          : item
      );
    } else if (val && typeof val === "object") {
      stripFromObject(val);
    }
  }
}

async function migrateCollection(collectionName) {
  const collection = mongoose.connection.collection(collectionName);
  const docs = await collection.find({}).toArray();
  let updated = 0;

  for (const doc of docs) {
    const original = JSON.stringify(doc);
    stripFromObject(doc);
    const modified = JSON.stringify(doc);

    if (original !== modified) {
      const { _id, ...rest } = doc;
      await collection.updateOne({ _id }, { $set: rest });
      updated++;
    }
  }

  console.log(`  ${collectionName}: ${updated}/${docs.length} documents updated`);
}

async function run() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const collections = await mongoose.connection.db.listCollections().toArray();
  const names = collections.map((c) => c.name);

  console.log(`📦 Found ${names.length} collections. Starting migration...\n`);

  for (const name of names) {
    await migrateCollection(name);
  }

  console.log("\n✅ Migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
