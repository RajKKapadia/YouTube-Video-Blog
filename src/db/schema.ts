import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const blogStatusEnum = pgEnum("blog_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  youtubeUrl: text("youtube_url").notNull(),
  youtubeVideoId: text("youtube_video_id").notNull(),
  title: text("title"),
  status: blogStatusEnum("status").notNull().default("pending"),
  statusMessage: text("status_message"),
  content: text("content"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
