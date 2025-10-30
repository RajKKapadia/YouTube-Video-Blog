#!/usr/bin/env tsx

/**
 * Worker process starter
 * This should be run as a separate process from the Next.js server
 *
 * Run with: pnpm worker
 */

import dotenv from "dotenv";
import path from "node:path";

// Try to load environment variables from multiple sources
const envFiles = [".env.local", ".env"];
let envLoaded = false;

for (const envFile of envFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  const { error } = dotenv.config({ path: envPath });

  if (!error) {
    console.log(`✅ Loaded environment variables from ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn(
    `⚠️  Unable to load environment file. Continuing with existing environment variables.`,
  );
}

// Main async function to start the worker
async function startWorker() {
  const loadWorkerModule = () => import("./blog-processor");
  const workerModulePromise = loadWorkerModule();

  await workerModulePromise;

  console.log("=".repeat(50));
  console.log("🚀 Blog Processing Worker Started");
  console.log("=".repeat(50));
  console.log("");
  console.log("The worker is now listening for jobs...");
  console.log("Press Ctrl+C to stop the worker");
  console.log("");

  async function shutdown() {
    console.log("\n\n⏹️  Shutting down worker gracefully...");
    try {
      const [{ blogWorker }, { closeDbConnection }] = await Promise.all([
        workerModulePromise,
        import("@/db"),
      ]);
      await blogWorker.close();
      await closeDbConnection();
      console.log("✅ Worker shut down successfully");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }

  // Handle graceful shutdown
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Start the worker
startWorker().catch((error) => {
  console.error("❌ Failed to start worker:", error);
  process.exit(1);
});
