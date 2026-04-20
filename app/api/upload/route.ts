import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHOOSE_PDF_API_KEY || process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: true, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: true, message: 'ChoosePDF API error configured' },
        { status: 500 }
      );
    }

    // Create a new FormData object to pass to PDF.co
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // Upload to PDF.co
    const res = await fetch('https://api.pdf.co/v1/file/upload', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: uploadFormData,
    });

    let result;
    try {
      result = await res.json();
    } catch (parseError) {
      const text = await res.text();
      console.error('PDF.co parse error:', text);
      return NextResponse.json(
        { error: true, message: 'Failed to parse response from upload service' },
        { status: 500 }
      );
    }

    if (!res.ok || result.error) {
      console.error('PDF.co upload error:', result);
      return NextResponse.json(
        { error: true, message: result.message || 'Upload to PDF.co failed' },
        { status: res.ok ? 400 : res.status }
      );
    }

    // Return the url in the exact same format
    return NextResponse.json({ 
      error: false,
      url: result.url,
      path: result.url 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
