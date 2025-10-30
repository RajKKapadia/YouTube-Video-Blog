import { Queue } from "bullmq";
import redis from "./redis";

export interface BlogJobData {
  blogId: string;
  videoId: string;
  youtubeUrl: string;
}

// Create the blog processing queue
export const blogQueue = new Queue<BlogJobData>("blog-processing", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

console.log("[Queue] Blog processing queue initialized");

export default blogQueue;
