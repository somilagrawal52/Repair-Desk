import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbLatencyMs = -1;
  let dbName = "repairdesk";

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      dbStatus = "connected";
      dbName = mongoose.connection.name || "repairdesk";
      // Perform a lightweight ping to measure DB round-trip latency
      if (mongoose.connection.db) {
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        dbLatencyMs = Date.now() - pingStart;
      }
    }
  } catch (error) {
    dbStatus = "error";
  }

  const isHealthy = dbStatus === "connected";
  const totalResponseMs = Date.now() - startTime;

  const responseBody = {
    status: isHealthy ? "healthy" : "degraded",
    product: "RepairDesk — Smart Electronics Repair Management System",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: totalResponseMs,
    database: {
      provider: "MongoDB",
      status: dbStatus,
      name: dbName,
      readyState: mongoose.connection.readyState,
      latencyMs: dbLatencyMs,
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
