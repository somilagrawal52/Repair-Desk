import mongoose from "mongoose";
import { seedMongoDatabase } from "../src/lib/seed-mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/repairdesk";

async function main() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected. Seeding database...");
  const res = await seedMongoDatabase(true);
  console.log("Result:", res.message);
  await mongoose.disconnect();
  console.log("Database connection closed.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
