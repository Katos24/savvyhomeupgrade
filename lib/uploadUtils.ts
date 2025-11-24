import { upload } from '@vercel/blob/client';

// Upload files directly to Vercel Blob (bypasses 4.5MB API limit)
export async function uploadFilesToBlob(
  files: File[]
): Promise<{ url: string; name: string; type: string; size: number }[]> {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      console.log(`Uploading ${file.name} directly to blob...`);
      
      // Add timestamp to filename to make it unique
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.name}`;

      // Upload directly to Vercel Blob using client-side upload
      const blob = await upload(uniqueFilename, file, {
        access: 'public',
        handleUploadUrl: '/api/get-upload-url',
      });

      uploadedFiles.push({
        url: blob.url,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      console.log(`✅ Uploaded: ${blob.url}`);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedFiles;
}
