import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import sharp from 'sharp';

const sql = neon(process.env.DATABASE_URL!);

// 🔥 Helper: Generate thumbnail for images
async function generateThumbnail(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Create 300x300 thumbnail (good balance of quality and size)
  const thumbnail = await sharp(buffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 }) // Convert to JPEG for smaller size
    .toBuffer();
  
  return thumbnail;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const leadId = formData.get('leadId') as string;
    const uploadType = formData.get('uploadType') as 'photo' | 'document';
    const userName = formData.get('userName') as string;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Missing leadId' },
        { status: 400 }
      );
    }

    // 🔥 Check if lead has a project
    const leadCheck = await sql`
      SELECT project_id FROM leads WHERE id = ${leadId}
    `;

    if (!leadCheck || leadCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const projectId = leadCheck[0]?.project_id;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'No project exists. Please convert to project first.' },
        { status: 400 }
      );
    }

    // Handle PHOTO UPLOAD with THUMBNAILS
    if (uploadType === 'photo') {
      const photoType = formData.get('photoType') as 'before' | 'after';
      const photos = formData.getAll('photos') as File[];

      if (photos.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No photos provided' },
          { status: 400 }
        );
      }

      const uploadedPhotos: { url: string; thumbnail: string }[] = [];

      for (const photo of photos) {
        // 🔥 Upload full-size photo
        const fullBlob = await put(
          `leads/${leadId}/photos/${photoType}/${Date.now()}-${photo.name}`,
          photo,
          { access: 'public' }
        );

        // 🔥 Generate and upload thumbnail
        const thumbnailBuffer = await generateThumbnail(photo);
        const thumbnailBlob = await put(
          `leads/${leadId}/photos/${photoType}/thumb-${Date.now()}-${photo.name}`,
          thumbnailBuffer,
          { access: 'public', contentType: 'image/jpeg' }
        );

        uploadedPhotos.push({
          url: fullBlob.url,
          thumbnail: thumbnailBlob.url
        });
      }

      // Get existing photos
      const project = await sql`
        SELECT before_photos, after_photos FROM projects WHERE id = ${projectId}
      `;

      let existingBeforePhotos: any[] = [];
      let existingAfterPhotos: any[] = [];

      try {
        existingBeforePhotos = project[0]?.before_photos 
          ? (typeof project[0].before_photos === 'string' 
              ? JSON.parse(project[0].before_photos) 
              : project[0].before_photos)
          : [];
        
        existingAfterPhotos = project[0]?.after_photos 
          ? (typeof project[0].after_photos === 'string' 
              ? JSON.parse(project[0].after_photos) 
              : project[0].after_photos)
          : [];
      } catch (e) {
        console.error('Error parsing photos:', e);
      }

      // Update photos array
      if (photoType === 'before') {
        existingBeforePhotos.push(...uploadedPhotos);
        await sql`
          UPDATE projects 
          SET before_photos = ${JSON.stringify(existingBeforePhotos)},
              updated_at = NOW()
          WHERE id = ${projectId}
        `;
      } else {
        existingAfterPhotos.push(...uploadedPhotos);
        await sql`
          UPDATE projects 
          SET after_photos = ${JSON.stringify(existingAfterPhotos)},
              updated_at = NOW()
          WHERE id = ${projectId}
        `;
      }

      // Add activity note
      await sql`
        UPDATE projects 
        SET notes = jsonb_insert(
          COALESCE(notes, '[]'::jsonb),
          '{0}',
          ${JSON.stringify({
            type: 'photo_upload',
            text: `${uploadedPhotos.length} ${photoType} photo${uploadedPhotos.length > 1 ? 's' : ''} uploaded`,
            user_name: userName,
            timestamp: new Date().toISOString()
          })}::jsonb
        )
        WHERE id = ${projectId}
      `;

      return NextResponse.json({
        success: true,
        uploadedCount: uploadedPhotos.length,
        photoType,
        photos: uploadedPhotos
      });
    }

    // Handle DOCUMENT UPLOAD (Optimized)
    if (uploadType === 'document') {
      const docType = formData.get('docType') as 'contract' | 'invoice' | 'permit' | 'other';
      const documents = formData.getAll('documents') as File[];

      if (documents.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No documents provided' },
          { status: 400 }
        );
      }

      const uploadedDocs: any[] = [];

      // 🔥 Upload documents with optimized settings
      for (const doc of documents) {
        const blob = await put(
          `leads/${leadId}/documents/${Date.now()}-${doc.name}`,
          doc,
          { 
            access: 'public',
            // Don't cache large files unnecessarily
            addRandomSuffix: false
          }
        );

        uploadedDocs.push({
          url: blob.url,
          name: doc.name,
          type: docType,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userName,
          size: doc.size // Track file size for future optimizations
        });
      }

      // Get existing documents
      const project = await sql`
        SELECT documents FROM projects WHERE id = ${projectId}
      `;

      let existingDocuments: any[] = [];
      try {
        existingDocuments = project[0]?.documents 
          ? (typeof project[0].documents === 'string' 
              ? JSON.parse(project[0].documents) 
              : project[0].documents)
          : [];
      } catch (e) {
        console.error('Error parsing documents:', e);
      }

      existingDocuments.push(...uploadedDocs);

      // Update documents
      await sql`
        UPDATE projects 
        SET documents = ${JSON.stringify(existingDocuments)},
            updated_at = NOW()
        WHERE id = ${projectId}
      `;

      // Add activity note
      await sql`
        UPDATE projects 
        SET notes = jsonb_insert(
          COALESCE(notes, '[]'::jsonb),
          '{0}',
          ${JSON.stringify({
            type: 'document_upload',
            text: `${uploadedDocs.length} document${uploadedDocs.length > 1 ? 's' : ''} uploaded (${docType})`,
            user_name: userName,
            timestamp: new Date().toISOString()
          })}::jsonb
        )
        WHERE id = ${projectId}
      `;

      return NextResponse.json({
        success: true,
        uploadedCount: uploadedDocs.length,
        docType,
        documents: uploadedDocs
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid upload type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};