import { Button } from "@/components/ui/button";
import { ConvertForm } from "@/components/convert-form";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <main className="w-full max-w-2xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="self-end">
            <Link href="/dashboard">
              <Button variant="outline">View Dashboard</Button>
            </Link>
          </div>
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              YouTube to Blog
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Transform your YouTube videos into engaging blog posts
            </p>
          </div>

          {/* Form */}
          <ConvertForm />

          {/* Features */}
          <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Automatic Transcription
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Extract and format video content into text
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Key Highlights
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Identify and extract important moments
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Readable Format
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Get a clean, formatted blog post
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
