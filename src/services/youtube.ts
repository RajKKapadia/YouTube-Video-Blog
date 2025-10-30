import { google } from "googleapis";
import { YoutubeTranscript } from "youtube-transcript";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export interface VideoMetadata {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  channelTitle: string;
}

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be links
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube.com links
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format ISO 8601 duration to readable format
 */
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = match[1] ? Number.parseInt(match[1]) : 0;
  const minutes = match[2] ? Number.parseInt(match[2]) : 0;
  const seconds = match[3] ? Number.parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Fetch video metadata from YouTube Data API
 */
export async function getVideoMetadata(
  videoId: string,
): Promise<VideoMetadata> {
  console.log("[YouTube Service] Fetching video metadata for:", videoId);
  console.log(
    "[YouTube Service] API Key configured:",
    !!process.env.YOUTUBE_API_KEY,
  );
  console.log(
    "[YouTube Service] API Key (first 10 chars):",
    process.env.YOUTUBE_API_KEY?.substring(0, 10),
  );

  try {
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      console.log("[YouTube Service] Video not found:", videoId);
      throw new Error("Video not found");
    }

    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    const metadata = {
      videoId,
      title: snippet?.title || "Untitled",
      thumbnailUrl:
        snippet?.thumbnails?.high?.url ||
        snippet?.thumbnails?.default?.url ||
        "",
      duration: contentDetails?.duration
        ? formatDuration(contentDetails.duration)
        : "0:00",
      channelTitle: snippet?.channelTitle || "Unknown",
    };

    console.log(
      "[YouTube Service] Metadata fetched successfully:",
      metadata.title,
    );
    return metadata;
  } catch (error: any) {
    console.error("[YouTube Service] Error fetching metadata:", error);
    console.error("[YouTube Service] Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    });

    // Provide more specific error messages
    if (error.code === 400) {
      throw new Error(
        "YouTube API Error: Invalid API key or API not enabled. Please check: 1) API key is correct 2) YouTube Data API v3 is enabled 3) API key has no restrictions blocking server requests",
      );
    }

    if (error.code === 403) {
      throw new Error(
        "YouTube API Error: Access forbidden. Check if API key has proper permissions and YouTube Data API v3 is enabled.",
      );
    }

    throw new Error(
      `Failed to fetch video metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Fetch video transcript/subtitles
 */
export async function getVideoTranscript(
  videoId: string,
): Promise<TranscriptItem[]> {
  console.log("[YouTube Service] Fetching transcript for:", videoId);

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(
      "[YouTube Service] Transcript fetched successfully:",
      transcript.length,
      "items",
    );
    return transcript;
  } catch (error) {
    console.error("[YouTube Service] Error fetching transcript:", error);
    throw new Error(
      `Failed to fetch video transcript: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Convert transcript to formatted text
 */
export function formatTranscript(transcript: TranscriptItem[]): string {
  return transcript.map((item) => item.text).join(" ");
}
