import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import {
  OrganizationModel,
  UserModel,
  CustomerModel,
  DeviceModel,
  RepairTicketModel,
  SequenceModel,
  InventoryItemModel,
  PaymentModel,
  EstimateModel,
  TicketNoteModel,
  TicketStatusHistoryModel,
  ReceiptModel,
  AuditLogModel,
  TicketAttachmentModel,
} from "../src/lib/models";
import { seedMongoDatabase } from "../src/lib/seed-mongodb";

async function main() {
  console.log("===================================================================");
  console.log("   REPAIRDESK — PRODUCTION ENVIRONMENT & DATABASE INITIALIZER     ");
  console.log("===================================================================\n");

  // 1. Verify Storage Directories
  console.log("▶ Step 1: Checking upload storage directories...");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`  ✓ Created public uploads directory: ${uploadsDir}`);
  } else {
    console.log(`  ✓ Public uploads directory exists: ${uploadsDir}`);
  }

  // 2. Connect to MongoDB
  console.log("\n▶ Step 2: Connecting to MongoDB...");
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/repairdesk";
  console.log(`  Target URI: ${uri}`);

  await connectToDatabase();
  console.log(`  ✓ MongoDB Connected. Ready State: ${mongoose.connection.readyState}`);

  // 3. Synchronize Indexes
  console.log("\n▶ Step 3: Synchronizing Indexes on Collections...");
  try {
    await OrganizationModel.syncIndexes();
    await UserModel.syncIndexes();
    await CustomerModel.syncIndexes();
    await DeviceModel.syncIndexes();
    await RepairTicketModel.syncIndexes();
    await SequenceModel.syncIndexes();
    await InventoryItemModel.syncIndexes();
    await PaymentModel.syncIndexes();
    await EstimateModel.syncIndexes();
    await TicketNoteModel.syncIndexes();
    await TicketStatusHistoryModel.syncIndexes();
    await ReceiptModel.syncIndexes();
    await AuditLogModel.syncIndexes();
    await TicketAttachmentModel.syncIndexes();
    console.log("  ✓ All 14 Mongoose model indexes synchronized successfully.");
  } catch (err: unknown) {
    console.warn("  ⚠ Index sync completed with notice:", (err as Error)?.message || err);
  }

  // 4. Verify Or Seed Initial Shop Data
  console.log("\n▶ Step 4: Checking Database Tenancy State...");
  const orgCount = await OrganizationModel.countDocuments();
  console.log(`  Found ${orgCount} existing organization(s).`);

  if (orgCount === 0 || process.argv.includes("--seed") || process.argv.includes("--force")) {
    console.log("  Seeding default commercial demo organization ('TechFix Indore')...");
    const seedResult = await seedMongoDatabase(true);
    console.log(`  ✓ ${seedResult.message}`);
  } else {
    console.log("  ✓ Existing shop records detected. Preserving production data.");
  }

  // 5. Verification Metrics
  const ticketCount = await RepairTicketModel.countDocuments();
  const customerCount = await CustomerModel.countDocuments();
  const inventoryCount = await InventoryItemModel.countDocuments();
  const userCount = await UserModel.countDocuments();

  console.log("\n===================================================================");
  console.log("                PRODUCTION INITIALIZATION COMPLETE                 ");
  console.log("===================================================================");
  console.log(`  Organizations: ${await OrganizationModel.countDocuments()}`);
  console.log(`  Staff Users:   ${userCount}`);
  console.log(`  Customers:     ${customerCount}`);
  console.log(`  Tickets:       ${ticketCount}`);
  console.log(`  Inventory:     ${inventoryCount} items`);
  console.log("-------------------------------------------------------------------");
  console.log("  Default Admin Credentials (TechFix Indore Demo):");
  console.log("  • Owner:        vikram@techfixindore.in (or owner@techfix.in)     [Password: password123]");
  console.log("  • Receptionist: sneha@techfixindore.in  (or reception@techfix.in) [Password: password123]");
  console.log("  • Technician:   amit.tech@techfixindore.in (or tech1@techfix.in)  [Password: password123]");
  console.log("-------------------------------------------------------------------");
  console.log("  Ready to launch: npm run build && npm start");
  console.log("===================================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("FATAL Setup Failure:", err);
  process.exit(1);
});
