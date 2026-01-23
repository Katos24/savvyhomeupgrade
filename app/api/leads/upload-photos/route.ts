import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const leadId = formData.get('leadId') as string;
    const photoType = formData.get('photoType') as 'before' | 'after';
    const userName = formData.get('userName') as string;
    const photos = formData.getAll('photos') as File[];

    if (!leadId || photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch existing lead data
    const leadResult = await sql`
      SELECT before_photos, after_photos, notes 
      FROM leads 
      WHERE id = ${leadId}
    `;

    if (!leadResult || leadResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leadResult[0];
    const uploadedUrls: string[] = [];
    
    // Upload each photo to Vercel Blob
    for (const photo of photos) {
      try {
        const blob = await put(`leads/${leadId}/${Date.now()}-${photo.name}`, photo, {
          access: 'public',
        });
        
        uploadedUrls.push(blob.url);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload any photos' },
        { status: 500 }
      );
    }

    // Get existing photos from the correct column
    const columnName = photoType === 'before' ? 'before_photos' : 'after_photos';
    let existingPhotos: string[] = [];
    
    try {
      const existingData = lead[columnName];
      if (existingData) {
        existingPhotos = typeof existingData === 'string' 
          ? JSON.parse(existingData) 
          : (Array.isArray(existingData) ? existingData : []);
      }
    } catch {
      existingPhotos = [];
    }

    // Merge with new photos
    const updatedPhotos = [...existingPhotos, ...uploadedUrls];

    // Parse existing notes
    let notesArray = [];
    try {
      notesArray = typeof lead.notes === 'string' 
        ? JSON.parse(lead.notes) 
        : (Array.isArray(lead.notes) ? lead.notes : []);
    } catch {
      notesArray = [];
    }

    // Add activity note
    const newNote = {
      type: 'photo_upload',
      text: `📸 ${userName} uploaded ${uploadedUrls.length} ${photoType} photo${uploadedUrls.length > 1 ? 's' : ''}`,
      user_name: userName,
      timestamp: new Date().toISOString()
    };

    notesArray.push(newNote);

    // Update database with Neon SQL
    if (photoType === 'before') {
      await sql`
        UPDATE leads 
        SET 
          before_photos = ${JSON.stringify(updatedPhotos)},
          notes = ${JSON.stringify(notesArray)},
          updated_at = NOW()
        WHERE id = ${leadId}
      `;
    } else {
      await sql`
        UPDATE leads 
        SET 
          after_photos = ${JSON.stringify(updatedPhotos)},
          notes = ${JSON.stringify(notesArray)},
          updated_at = NOW()
        WHERE id = ${leadId}
      `;
    }

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedUrls.length,
      photoType,
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}