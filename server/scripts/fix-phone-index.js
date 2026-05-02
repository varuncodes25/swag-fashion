/**
 * One-time fix for E11000 duplicate key { phone: null } on phone_1.
 *
 * 1) Drops legacy unique index on phone (often named phone_1) that indexed null.
 * 2) Removes explicit phone:null from documents so only real numbers are stored.
 * 3) Recreates indexes from the User model (partial unique on string phones only).
 *
 * Run from repo root: node server/scripts/fix-phone-index.js
 * Requires MONGO_URI in server/.env (or cwd .env).
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const col = mongoose.connection.collection("users");

  for (const name of ["phone_1"]) {
    try {
      await col.dropIndex(name);
      console.log("Dropped index:", name);
    } catch (e) {
      if (e.code !== 27 && e.codeName !== "IndexNotFound") {
        console.warn("dropIndex", name, e.message);
      }
    }
  }

  const unset = await col.updateMany({ phone: null }, { $unset: { phone: "" } });
  console.log("Unset phone:null on documents:", unset.modifiedCount);

  await User.syncIndexes();
  console.log("User.syncIndexes() done.");
  console.log("Remaining phone-related indexes:", (await col.indexes()).filter((i) => i.key?.phone));

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
