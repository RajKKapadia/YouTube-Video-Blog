import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
          <svg
            className="h-16 w-16 text-zinc-600 dark:text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Blog Not Found
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            The blog post you're looking for doesn't exist.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/">
              <Button>Create New Blog</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
