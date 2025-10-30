import { Worker, Job } from "bullmq";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getVideoMetadata,
  getVideoTranscript,
  formatTranscript,
} from "@/services/youtube";
import { generateBlogContent, generateThumbnailUrl } from "@/services/ai";
import redis from "@/lib/redis";
import type { BlogJobData } from "@/lib/queue";

// Create the worker
export const blogWorker = new Worker<BlogJobData>(
  "blog-processing",
  async (job: Job<BlogJobData>) => {
    const { blogId, videoId, youtubeUrl } = job.data;

    console.log(
      `[Worker ${job.id}] Starting blog processing for video: ${videoId}`,
    );
    console.log(`[Worker ${job.id}] Blog ID: ${blogId}`);

    try {
      // Update progress: 10%
      await job.updateProgress(10);

      // Update status to processing
      console.log(`[Worker ${job.id}] Updating status to processing...`);
      await db
        .update(blogs)
        .set({
          status: "processing",
          statusMessage: "Starting blog generation..."
        })
        .where(eq(blogs.id, blogId));

      // Update progress: 20%
      await job.updateProgress(20);

      // Fetch video metadata
      console.log(`[Worker ${job.id}] Fetching video metadata...`);
      await db
        .update(blogs)
        .set({ statusMessage: "Fetching video metadata..." })
        .where(eq(blogs.id, blogId));

      const metadata = await getVideoMetadata(videoId);
      console.log(`[Worker ${job.id}] Metadata fetched:`, {
        title: metadata.title,
        channel: metadata.channelTitle,
        duration: metadata.duration,
      });

      // Update progress: 40%
      await job.updateProgress(40);

      // Fetch transcript
      console.log(`[Worker ${job.id}] Fetching video transcript...`);
      await db
        .update(blogs)
        .set({ statusMessage: "Fetching video transcript..." })
        .where(eq(blogs.id, blogId));

      const transcript = await getVideoTranscript(videoId);
      console.log(
        `[Worker ${job.id}] Transcript fetched: ${transcript.length} items`,
      );

      const rawTranscript = formatTranscript(transcript);
      console.log(
        `[Worker ${job.id}] Raw transcript length: ${rawTranscript.length} characters`,
      );

      // Update progress: 60%
      await job.updateProgress(60);

      // Generate blog content using AI
      console.log(`[Worker ${job.id}] Generating blog content with AI...`);
      await db
        .update(blogs)
        .set({ statusMessage: "Generating blog content with AI..." })
        .where(eq(blogs.id, blogId));

      const blogContent = await generateBlogContent(
        rawTranscript,
        metadata.title,
        metadata.channelTitle,
      );
      console.log(`[Worker ${job.id}] Blog content generated:`, {
        title: blogContent.title,
        contentLength: blogContent.content.length,
        thumbnailPrompt: blogContent.thumbnailPrompt.slice(0, 100) + "...",
      });

      // Update progress: 80%
      await job.updateProgress(80);

      // Generate thumbnail URL
      console.log(`[Worker ${job.id}] Generating thumbnail URL...`);
      await db
        .update(blogs)
        .set({ statusMessage: "Generating thumbnail image..." })
        .where(eq(blogs.id, blogId));

      const thumbnailUrl = await generateThumbnailUrl(
        blogContent.thumbnailPrompt,
        blogContent.title,
      );
      console.log(
        `[Worker ${job.id}] Thumbnail URL generated: ${thumbnailUrl}`,
      );

      // Update progress: 90%
      await job.updateProgress(90);

      // Update blog with all data
      console.log(`[Worker ${job.id}] Updating blog with final data...`);
      await db
        .update(blogs)
        .set({ statusMessage: "Finalizing blog post..." })
        .where(eq(blogs.id, blogId));

      await db
        .update(blogs)
        .set({
          title: blogContent.title,
          thumbnailUrl: thumbnailUrl,
          duration: metadata.duration,
          content: blogContent.content,
          status: "completed",
          statusMessage: null, // Clear status message on completion
        })
        .where(eq(blogs.id, blogId));

      // Update progress: 100%
      await job.updateProgress(100);

      console.log(
        `[Worker ${job.id}] ✅ Blog processing completed successfully!`,
      );

      return {
        blogId,
        status: "completed",
        title: blogContent.title,
      };
    } catch (error) {
      console.error(`[Worker ${job.id}] ❌ Error processing video:`, error);

      // Update blog with error
      await db
        .update(blogs)
        .set({
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error occurred",
        })
        .where(eq(blogs.id, blogId));

      console.log(
        `[Worker ${job.id}] Blog marked as failed with error message`,
      );

      throw error; // Re-throw to mark job as failed
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs concurrently
  },
);

// Worker event listeners
blogWorker.on("completed", (job) => {
  console.log(`[Worker] ✅ Job ${job.id} completed successfully`);
});

blogWorker.on("failed", (job, err) => {
  console.error(`[Worker] ❌ Job ${job?.id} failed:`, err.message);
});

blogWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});

console.log("[Worker] Blog processing worker started with concurrency: 5");

export default blogWorker;
