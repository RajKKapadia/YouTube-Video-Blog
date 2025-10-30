"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type BlogStatus = "pending" | "processing" | "completed" | "failed";

interface Blog {
  id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string | null;
  status: BlogStatus;
  statusMessage: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogWithProgress extends Blog {
  progress?: number;
}

interface BlogTableProps {
  initialBlogs: Blog[];
}

export function BlogTable({ initialBlogs }: BlogTableProps) {
  const [blogs, setBlogs] = useState<BlogWithProgress[]>(initialBlogs);
  const [isPolling, setIsPolling] = useState(false);

  // Check if there are any active jobs (pending or processing)
  const hasActiveJobs = blogs.some(
    (blog) => blog.status === "pending" || blog.status === "processing"
  );

  useEffect(() => {
    if (!hasActiveJobs) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Poll for updates every 2 seconds when there are active jobs
    const interval = setInterval(async () => {
      try {
        // Fetch updated blogs data
        const response = await fetch("/api/blogs");
        if (response.ok) {
          const updatedBlogs = await response.json();

          // Fetch progress for pending/processing blogs
          const blogsWithProgress = await Promise.all(
            updatedBlogs.map(async (blog: Blog) => {
              if (blog.status === "pending" || blog.status === "processing") {
                try {
                  const statusResponse = await fetch(
                    `/api/blogs/${blog.id}/status`
                  );
                  if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    return {
                      ...blog,
                      progress:
                        typeof statusData.progress === "number"
                          ? statusData.progress
                          : 0,
                    };
                  }
                } catch (error) {
                  console.error(
                    `Error fetching status for blog ${blog.id}:`,
                    error
                  );
                }
              }
              return blog;
            })
          );

          setBlogs(blogsWithProgress);
        }
      } catch (error) {
        console.error("Error polling for updates:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hasActiveJobs, blogs]);

  const getStatusBadgeVariant = (status: BlogStatus) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (blogs.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Video ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No blogs generated yet
                  </p>
                  <Link href="/">
                    <Button variant="outline" size="sm">
                      Generate Your First Blog
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isPolling && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Auto-refreshing... Processing {blogs.filter(b => b.status === "pending" || b.status === "processing").length} blog(s)</span>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Video ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>
                  {blog.thumbnailUrl ? (
                    <img
                      src={blog.thumbnailUrl}
                      alt={blog.title || "Video thumbnail"}
                      className="h-12 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{blog.title || "Untitled"}</div>
                    {(blog.status === "pending" ||
                      blog.status === "processing") && (
                      <div className="space-y-1">
                        <Progress
                          value={blog.progress || 0}
                          className="h-1.5 w-full"
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {blog.progress || 0}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {blog.youtubeVideoId}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={getStatusBadgeVariant(blog.status)}>
                      {blog.status}
                    </Badge>
                    {blog.statusMessage && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {blog.statusMessage}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{blog.duration || "N/A"}</TableCell>
                <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDistanceToNow(new Date(blog.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {blog.status === "completed" && (
                    <Link href={`/blog/${blog.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  )}
                  {blog.status === "failed" && blog.errorMessage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title={blog.errorMessage}
                    >
                      Error
                    </Button>
                  )}
                  {(blog.status === "pending" ||
                    blog.status === "processing") && (
                    <div className="flex items-center justify-end gap-1 text-xs text-zinc-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Total blogs: {blogs.length}
      </div>
    </div>
  );
}
