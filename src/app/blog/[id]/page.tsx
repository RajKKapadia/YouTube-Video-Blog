import { db } from "@/db";
import { blogs } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, Youtube, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface BlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;

  // Fetch blog from database
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));

  if (!blog) {
    notFound();
  }

  // Handle different statuses
  if (blog.status === "pending" || blog.status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50" />
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {blog.status === "pending"
                  ? "Blog Processing Starting..."
                  : "Generating Blog Content..."}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Please wait while we convert your YouTube video into a blog post
              </p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button variant="outline">View Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (blog.status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
              <svg
                className="h-16 w-16 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Blog Generation Failed
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {blog.errorMessage || "An unknown error occurred"}
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/">
                  <Button>Try Another Video</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">View Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
          >
            YouTube to Blog
          </Link>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm">New Blog</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <article className="mx-auto max-w-4xl">
          {/* Thumbnail */}
          {blog.thumbnailUrl && (
            <div className="mb-10 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
              <img
                src={blog.thumbnailUrl}
                alt={blog.title || "Blog thumbnail"}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(blog.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {blog.content && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{calculateReadingTime(blog.content)} min read</span>
              </div>
            )}
            {blog.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.duration} video</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              <a
                href={blog.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-50"
              >
                Watch Original Video
              </a>
            </div>
            <Badge variant="default">Completed</Badge>
          </div>

          {/* Title */}
          <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl sm:leading-tight text-justify">
            {blog.title}
          </h1>

          {/* Blog Content - Markdown Rendered */}
          <div className="prose prose-lg prose-zinc max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
            prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-3xl prose-h2:leading-snug
            prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-2xl prose-h3:leading-snug
            prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-xl
            prose-p:mb-6 prose-p:leading-relaxed prose-p:text-zinc-700 prose-p:text-justify dark:prose-p:text-zinc-300
            prose-a:font-medium prose-a:text-blue-600 prose-a:no-underline prose-a:transition-colors hover:prose-a:text-blue-700 hover:prose-a:underline dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300
            prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50
            prose-ul:my-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:space-y-2
            prose-li:my-2 prose-li:leading-relaxed prose-li:text-justify
            prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:text-justify dark:prose-blockquote:border-blue-400 dark:prose-blockquote:bg-blue-950/30
            prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-zinc-900 prose-code:before:content-[''] prose-code:after:content-[''] dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-50
            prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-zinc-900 prose-pre:p-4 dark:prose-pre:bg-zinc-950
            prose-img:my-8 prose-img:rounded-lg prose-img:shadow-lg
            prose-hr:my-12 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
            prose-table:my-6
            first:prose-p:text-xl first:prose-p:leading-relaxed first:prose-p:text-zinc-600 first:prose-p:text-justify dark:first:prose-p:text-zinc-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content || "No content available."}
            </ReactMarkdown>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 flex flex-col gap-4 border-t border-zinc-200 pt-10 dark:border-zinc-800 sm:flex-row sm:gap-6">
            <Link href={blog.youtubeUrl} target="_blank" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-base">
                <Youtube className="mr-2 h-5 w-5" />
                Watch Original Video
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full h-12 text-base">Convert Another Video</Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
