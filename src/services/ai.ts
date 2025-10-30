import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { prompts } from "@/config/prompts";
import OpenAI from "openai";

const model = google("gemini-2.5-flash");

// Initialize OpenAI client for DALL-E
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface BlogContent {
  title: string;
  content: string;
  thumbnailPrompt: string;
}

/**
 * Generate blog content from video transcript using Gemini
 */
export async function generateBlogContent(
  transcript: string,
  videoTitle: string,
  channelName: string,
): Promise<BlogContent> {
  console.log("[AI Service] Starting blog content generation...");
  console.log("[AI Service] Video title:", videoTitle);
  console.log(
    "[AI Service] Transcript length:",
    transcript.length,
    "characters",
  );

  try {
    // Generate structured blog content using prompts from config
    const result = await generateObject({
      model,
      schema: z.object({
        title: z.string().describe(prompts.blogGeneration.schema.title),
        content: z.string().describe(prompts.blogGeneration.schema.content),
        thumbnailPrompt: z
          .string()
          .describe(prompts.blogGeneration.schema.thumbnailPrompt),
      }),
      system: prompts.blogGeneration.system,
      prompt: prompts.blogGeneration.getUserPrompt(
        transcript,
        videoTitle,
        channelName,
      ),
    });

    console.log("[AI Service] Successfully generated blog content");
    console.log("[AI Service] Generated title:", result.object.title);
    console.log(
      "[AI Service] Generated content length:",
      result.object.content.length,
      "characters",
    );

    return result.object;
  } catch (error) {
    console.error("[AI Service] Error generating blog content:", error);
    throw new Error(
      `Failed to generate blog content: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate a thumbnail URL using DALL-E 3
 * Creates an AI-generated image based on the thumbnail prompt
 */
export async function generateThumbnailUrl(
  thumbnailPrompt: string,
  videoTitle: string,
): Promise<string> {
  console.log("[AI Service] Generating thumbnail with DALL-E...");
  console.log("[AI Service] Thumbnail prompt:", thumbnailPrompt);

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "[AI Service] OpenAI API key not configured, using placeholder",
      );
      const encodedTitle = encodeURIComponent(videoTitle.slice(0, 50));
      return `https://placehold.co/1200x630/2563eb/white?text=${encodedTitle}&font=raleway`;
    }

    // Optimize the prompt for DALL-E (max 4000 characters)
    const optimizedPrompt = thumbnailPrompt.slice(0, 1000);

    // Generate image using DALL-E 3
    console.log("[AI Service] Calling DALL-E 3...");
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional blog thumbnail image: ${optimizedPrompt}. Style: modern, clean, eye-catching, suitable for a blog post header.`,
      n: 1,
      size: "1792x1024", // Wide format for blog thumbnails
      quality: "standard", // Use "hd" for higher quality (costs more)
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E");
    }

    console.log("[AI Service] ✅ DALL-E thumbnail generated successfully");
    console.log("[AI Service] Image URL:", imageUrl);

    return imageUrl;
  } catch (error: any) {
    console.error("[AI Service] ❌ Error generating thumbnail with DALL-E:", error);

    // Provide detailed error information
    if (error.status === 401) {
      console.error("[AI Service] Invalid OpenAI API key");
    } else if (error.status === 429) {
      console.error("[AI Service] Rate limit exceeded or quota reached");
    } else if (error.status === 400) {
      console.error("[AI Service] Invalid request:", error.message);
    }

    // Fallback to placeholder on any error
    console.log("[AI Service] Falling back to placeholder image");
    const encodedTitle = encodeURIComponent(videoTitle.slice(0, 50));
    return `https://placehold.co/1200x630/2563eb/white?text=${encodedTitle}&font=raleway`;
  }
}

/**
 * Enhanced text generation for additional AI tasks
 */
export async function generateSummary(content: string): Promise<string> {
  console.log("[AI Service] Generating summary...");

  try {
    const { text } = await generateText({
      model,
      prompt: prompts.summary.getUserPrompt(content),
      tools: {
        google_search: google.tools.googleSearch({}),
      }
    });

    console.log("[AI Service] Successfully generated summary");
    return text;
  } catch (error) {
    console.error("[AI Service] Error generating summary:", error);
    throw new Error(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
