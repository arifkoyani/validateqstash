import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
  "";

const PDF_TO_QRCODE_URL =
  process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  "https://api.pdf.co/v1/barcode/generate";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function verifySignature(request: NextRequest, rawBody: string) {
  const signature = request.headers.get("upstash-signature");
  if (!signature) throw new Error("Missing Upstash signature");

  await receiver.verify({
    signature,
    body: rawBody,
    url: `${process.env.APP_BASE_URL}/api/pdftoqrcode/process`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    await verifySignature(request, rawBody);

    const body = JSON.parse(rawBody);

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
      return NextResponse.json(
        {
          error: true,
          message:
            data?.message || data?.error || data?.body?.error || "Barcode generation failed",
        },
        { status: res.ok ? 400 : res.status }
      );
    }

    return NextResponse.json({
      error: false,
      url: data.url,
      name: data.name || body.name || "qrcode.png",
      status: data.status || 200,
      remainingCredits: data.remainingCredits || 0,
    });
  } catch (error) {
    console.error("[pdftoqrcode/process] error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}