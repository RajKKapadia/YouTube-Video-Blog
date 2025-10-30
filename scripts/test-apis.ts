/**
 * Test script to verify API keys are configured correctly
 * Run with: npx tsx scripts/test-apis.ts
 */

import { google } from "googleapis";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testYouTubeAPI() {
  console.log("\n🔍 Testing YouTube API...");
  console.log("API Key present:", !!process.env.YOUTUBE_API_KEY);
  console.log(
    "API Key (first 20 chars):",
    process.env.YOUTUBE_API_KEY?.substring(0, 20),
  );

  if (!process.env.YOUTUBE_API_KEY) {
    console.error("❌ YOUTUBE_API_KEY not found in .env.local");
    return false;
  }

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    // Test with a known video ID (a popular public video)
    const testVideoId = "dQw4w9WgXcQ"; // Rick Astley - Never Gonna Give You Up
    console.log(`\nTesting with video ID: ${testVideoId}`);

    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [testVideoId],
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      console.log("✅ YouTube API is working!");
      console.log("   Video Title:", video.snippet?.title);
      console.log("   Channel:", video.snippet?.channelTitle);
      console.log("   Duration:", video.contentDetails?.duration);
      return true;
    } else {
      console.error("❌ No video data returned");
      return false;
    }
  } catch (error: any) {
    console.error("❌ YouTube API Error:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    console.error("   Status:", error.status);

    if (error.code === 400) {
      console.error("\n💡 Possible fixes:");
      console.error("   1. Check if your API key is correct");
      console.error(
        "   2. Enable YouTube Data API v3: https://console.cloud.google.com/apis/library/youtube.googleapis.com",
      );
      console.error(
        "   3. Check API key restrictions are not blocking requests",
      );
    }

    if (error.code === 403) {
      console.error("\n💡 Possible fixes:");
      console.error("   1. Check API key permissions");
      console.error("   2. Verify YouTube Data API v3 is enabled");
      console.error("   3. Check if you've exceeded quota limits");
    }

    return false;
  }
}

async function testGeminiAPI() {
  console.log("\n🔍 Testing Gemini API...");
  console.log("API Key present:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  console.log(
    "API Key (first 20 chars):",
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 20),
  );

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local");
    return false;
  }

  try {
    const { google } = await import("@ai-sdk/google");
    const { generateText } = await import("ai");

    const model = google("gemini-2.5-flash");

    const { text } = await generateText({
      model,
      prompt: "Say 'Hello, World!' and nothing else.",
    });

    console.log(text);

    console.log("✅ Gemini API is working!");
    console.log("   Response:", text);
    return true;
  } catch (error: any) {
    console.error("❌ Gemini API Error:");
    console.error("   Message:", error.message);
    console.error("\n💡 Possible fixes:");
    console.error(
      "   1. Get API key from: https://aistudio.google.com/app/apikey",
    );
    console.error("   2. Make sure the API key is valid and not expired");
    return false;
  }
}

async function testDatabase() {
  console.log("\n🔍 Testing Database Connection...");
  console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    return false;
  }

  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(process.env.DATABASE_URL);

    const result = await sql`SELECT NOW() as time`;
    await sql.end();

    console.log("✅ Database connection is working!");
    console.log("   Server time:", result[0].time);
    return true;
  } catch (error: any) {
    console.error("❌ Database Error:");
    console.error("   Message:", error.message);
    console.error("\n💡 Possible fixes:");
    console.error("   1. Make sure PostgreSQL is running");
    console.error("   2. Verify database credentials in .env.local");
    console.error("   3. Check if database 'youtube_blog' exists");
    return false;
  }
}

async function main() {
  console.log("🚀 Testing API Configuration...\n");
  console.log("=".repeat(50));

  const youtubeOk = await testYouTubeAPI();
  console.log("\n" + "=".repeat(50));

  const geminiOk = await testGeminiAPI();
  console.log("\n" + "=".repeat(50));

  const dbOk = await testDatabase();
  console.log("\n" + "=".repeat(50));

  console.log("\n📊 Summary:");
  console.log(`   YouTube API: ${youtubeOk ? "✅" : "❌"}`);
  console.log(`   Gemini API:  ${geminiOk ? "✅" : "❌"}`);
  console.log(`   Database:    ${dbOk ? "✅" : "❌"}`);

  if (youtubeOk && geminiOk && dbOk) {
    console.log("\n🎉 All APIs are configured correctly! You're ready to go!");
  } else {
    console.log("\n⚠️  Some APIs need attention. Please fix the issues above.");
    process.exit(1);
  }
}

main().catch(console.error);
