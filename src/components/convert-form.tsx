"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  youtubeUrl: z.url("Please enter a valid URL").refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        return (
          urlObj.hostname.includes("youtube.com") ||
          urlObj.hostname === "youtu.be"
        );
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid YouTube URL" },
  ),
});

type FormData = z.infer<typeof formSchema>;

export function ConvertForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to convert video");
      }

      toast.success("Video conversion started! Redirecting to dashboard...");
      reset();

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to convert video",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            {...register("youtubeUrl")}
            type="url"
            placeholder="Paste YouTube video URL here..."
            disabled={isLoading}
            className="flex-1"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to Blog"
          )}
        </Button>
      </div>
      {errors.youtubeUrl && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {errors.youtubeUrl.message}
        </p>
      )}
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        Enter a YouTube video URL and we'll convert it into a readable blog post
        with timestamps, key points, and summaries.
      </p>
    </form>
  );
}
