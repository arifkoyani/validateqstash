import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: true, message: "jobId is required" }, { status: 400 });
  }

  const job = await redis.get(`job:${jobId}`);

  if (!job) {
    return NextResponse.json(
      { error: true, status: "not_found", message: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
}