import { db } from "@/db";
import { blogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogTable } from "@/components/blog-table";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Blog Dashboard
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              View and manage your generated blog posts
            </p>
          </div>
          <Link href="/">
            <Button>Create New Blog</Button>
          </Link>
        </div>

        <BlogTable initialBlogs={allBlogs} />
      </div>
    </div>
  );
}
