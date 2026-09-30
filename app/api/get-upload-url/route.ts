// app/api/get-upload-url/route.ts — same rules as app/api/blob-upload/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Public upload token route (the booking form uses it without a login),
// so every token now carries a file-type list AND a size cap. Before,
// anyone with the URL could upload files of any size to your storage.

const MB = 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

const VIDEO_EXT = /\.(mp4|mov|avi)$/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif)$/i;
const DOC_EXT = /\.(pdf|docx?|xlsx?|csv)$/i;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Size limit depends on the kind of file being uploaded.
        if (VIDEO_EXT.test(pathname)) {
          return { allowedContentTypes: VIDEO_TYPES, maximumSizeInBytes: 200 * MB, addRandomSuffix: true };
        }
        if (IMAGE_EXT.test(pathname)) {
          return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: 25 * MB, addRandomSuffix: true };
        }
        if (DOC_EXT.test(pathname)) {
          return { allowedContentTypes: DOC_TYPES, maximumSizeInBytes: 25 * MB, addRandomSuffix: true };
        }
        // No recognizable extension in the name: still only allow the
        // listed file types, with the smaller size cap.
        return {
          allowedContentTypes: [...IMAGE_TYPES, ...DOC_TYPES],
          maximumSizeInBytes: 25 * MB,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}