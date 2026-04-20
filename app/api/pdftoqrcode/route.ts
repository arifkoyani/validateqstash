import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";

const client = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let name: string | undefined;
    let type: string | undefined;
    let value: string | undefined;
    let inline: boolean | undefined;
    let asyncFlag: boolean | undefined;
    let profiles: string | undefined;
    let decorationImage: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      name = (formData.get("name") as string) || undefined;
      type = (formData.get("type") as string) || undefined;
      value = (formData.get("value") as string) || undefined;
      profiles = (formData.get("profiles") as string) || undefined;

      const inlineRaw = formData.get("inline") as string;
      const asyncRaw = formData.get("async") as string;
      inline = inlineRaw === "true" ? true : inlineRaw === "false" ? false : undefined;
      asyncFlag = asyncRaw === "true" ? true : asyncRaw === "false" ? false : undefined;

      const decorationImageRaw = formData.get("decorationImage") ?? formData.get("decorationImageFile");
      if (typeof decorationImageRaw === "string" && decorationImageRaw) {
        decorationImage = decorationImageRaw;
      } else if (decorationImageRaw instanceof File && decorationImageRaw.size > 0) {
        const bytes = Buffer.from(await decorationImageRaw.arrayBuffer());
        decorationImage = `data:${decorationImageRaw.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;
      }
    } else {
      const body = await request.json();
      name = body?.name;
      type = body?.type;
      value = body?.value;
      inline = body?.inline;
      asyncFlag = body?.async;
      profiles = body?.profiles;
      decorationImage = body?.decorationImage;
    }

    if (!value) {
      return NextResponse.json({ error: true, message: "Value is required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: true, message: "Barcode type is required" }, { status: 400 });
    }

    if (!process.env.CHOOSE_PDF_API_KEY) {
      return NextResponse.json({ error: true, message: "ChoosePDF API not configured" }, { status: 500 });
    }

    const appBaseUrl = process.env.APP_BASE_URL;
    if (!appBaseUrl) {
      return NextResponse.json({ error: true, message: "APP_BASE_URL is not configured" }, { status: 500 });
    }

    const jobId = randomUUID();

    const job = {
      jobId,
      name: name || "barcode.png",
      type,
      value,
      inline: inline !== undefined ? inline : true,
      async: asyncFlag !== undefined ? asyncFlag : false,
      profiles:
        profiles ||
        JSON.stringify({
          Angle: 0,
          NarrowBarWidth: 30,
          ForeColor: "#000000",
          BackColor: "#ffffff",
        }),
      decorationImage,
    };

    await redis.set(`job:${jobId}`, { status: "processing", jobId });

    const result = await client.publishJSON({
      url: `${appBaseUrl.replace(/\/$/, "")}/api/pdftoqrcode/process`,
      body: job,
      retries: 3,
      flowControl: {
        key: "pdfco-pdftoqrcode",
        rate: 2,
        period: "1s",
        parallelism: 2,
      },
    });

    return NextResponse.json({
      error: false,
      queued: true,
      jobId,
      messageId: result.messageId,
      message: "Request queued successfully",
    });
  } catch (error) {
    console.error("[pdftoqrcode] enqueue error:", error);
    return NextResponse.json(
      { error: true, message: "Failed to queue request" },
      { status: 500 }
    );
  }
}