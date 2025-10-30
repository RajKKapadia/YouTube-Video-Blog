import { blogQueue } from "@/lib/queue";
import { NextResponse } from "next/server";

interface StatusParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: StatusParams) {
  try {
    const { id } = await params;
    console.log(`[API] Checking job status for blog ID: ${id}`);

    // Get job from queue
    const job = await blogQueue.getJob(id);

    if (!job) {
      console.log(`[API] Job not found for ID: ${id}`);
      return NextResponse.json(
        {
          error: "Job not found",
        },
        { status: 404 },
      );
    }

    // Get job state and progress
    const state = await job.getState();
    const progress = job.progress;

    console.log(`[API] Job ${id} status:`, { state, progress });

    // Get additional info based on state
    let response: any = {
      id: job.id,
      state,
      progress,
      data: job.data,
    };

    if (state === "completed") {
      response.result = job.returnvalue;
      response.finishedOn = job.finishedOn;
    } else if (state === "failed") {
      response.error = job.failedReason;
      response.failedOn = job.finishedOn;
      response.attempts = job.attemptsMade;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error checking job status:", error);
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 500 },
    );
  }
}
