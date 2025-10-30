import { db } from "@/db";
import { blogs } from "@/db/schema";
import { extractVideoId } from "@/services/youtube";
import { blogQueue } from "@/lib/queue";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    return NextResponse.json(allBlogs);
  } catch (error) {
    console.error("[API] Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  console.log("[API] Received blog conversion request");

  try {
    const { youtubeUrl } = await request.json();
    console.log("[API] YouTube URL:", youtubeUrl);

    // Validate YouTube URL
    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      console.log("[API] Error: Invalid YouTube URL");
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 },
      );
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    console.log("[API] Extracted video ID:", videoId);

    if (!videoId) {
      console.log("[API] Error: Could not extract video ID");
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 },
      );
    }

    // Create initial blog entry with pending status
    console.log("[API] Creating blog entry in database...");
    const [newBlog] = await db
      .insert(blogs)
      .values({
        youtubeUrl,
        youtubeVideoId: videoId,
        status: "pending",
      })
      .returning();

    console.log("[API] Blog entry created with ID:", newBlog.id);

    // Add job to queue for processing
    console.log("[API] Adding job to queue...");
    const job = await blogQueue.add(
      `blog-${newBlog.id}`,
      {
        blogId: newBlog.id,
        videoId: videoId,
        youtubeUrl: youtubeUrl,
      },
      {
        jobId: newBlog.id, // Use blog ID as job ID for easy tracking
      },
    );

    console.log("[API] Job added to queue with ID:", job.id);

    return NextResponse.json(
      {
        id: newBlog.id,
        jobId: job.id,
        message: "Blog conversion queued",
        status: "pending",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 },
    );
  }
}
