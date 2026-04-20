import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { redis } from "@/lib/redis";

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  "";

const PDF_TO_QRCODE_URL =
  process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  "https://api.pdf.co/v1/barcode/generate";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function verifySignature(request: NextRequest, rawBody: string) {
  const appBaseUrl = process.env.APP_BASE_URL;
  if (!appBaseUrl) throw new Error("APP_BASE_URL is not configured");

  const signature = request.headers.get("upstash-signature");
  if (!signature) throw new Error("Missing Upstash signature");

  await receiver.verify({
    signature,
    body: rawBody,
    url: `${appBaseUrl.replace(/\/$/, "")}/api/pdftoqrcode/process`,
  });
}

export async function POST(request: NextRequest) {
  let jobId: string | undefined;
  try {
    const rawBody = await request.text();
    await verifySignature(request, rawBody);

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: true, message: "Invalid JSON body" }, { status: 400 });
    }

    jobId = body?.jobId;
    if (!jobId) {
      return NextResponse.json({ error: true, message: "Missing jobId" }, { status: 400 });
    }

    const payload: Record<string, any> = {
      name: body.name || "barcode.png",
      type: body.type,
      value: body.value,
      inline: body.inline !== undefined ? body.inline : true,
      async: body.async !== undefined ? body.async : false,
      profiles: body.profiles,
    };

    if (body.decorationImage) {
      payload.decorationImage = body.decorationImage;
    }

    const res = await fetch(PDF_TO_QRCODE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    let data: any;
    const ct = res.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      return NextResponse.json(
        { error: true, message: text || "Barcode generation failed" },
        { status: res.status }
      );
    }

    if (!res.ok || data?.error === true) {
      const message =
        data?.message || data?.error || data?.body?.error || "Barcode generation failed";

      await redis.set(`job:${jobId}`, {
        status: "failed",
        message,
      });

      return NextResponse.json(
        {
          error: true,
          message,
        },
        { status: res.ok ? 400 : res.status }
      );
    }

    await redis.set(`job:${jobId}`, {
      status: "done",
      data: {
        url: data.url,
        name: data.name || body.name || "qrcode.png",
        status: data.status || 200,
        remainingCredits: data.remainingCredits || 0,
      },
    });

    return NextResponse.json({
      error: false,
      jobId,
      status: "done",
    });
  } catch (error) {
    console.error("[pdftoqrcode/process] error:", error);

    const message = error instanceof Error ? error.message : "Internal server error";
    if (jobId) {
      await redis.set(`job:${jobId}`, {
        status: "failed",
        message,
      });
    }

    return NextResponse.json(
      { error: true, message },
      { status: 500 }
    );
  }
}