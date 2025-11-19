import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const company_id = formData.get('company_id') as string;
    
    const files = formData.getAll('files') as File[];
    
    // Upload files to Vercel Blob
    const uploadedUrls = [];
    for (const file of files) {
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
      });
      
      uploadedUrls.push({
        name: file.name,
        url: blob.url,
        size: file.size
      });
    }

    // Get image URLs for AI analysis
    const imageUrls = uploadedUrls
      .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(file => file.url);

    // Run AI analysis if there are images
    let aiAnalysis = null;
    if (imageUrls.length > 0) {
      try {
        const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/analyze-photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrls,
            category,
            description
          })
        });
        
        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          aiAnalysis = analysisData.analysis;
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
        // Continue without AI analysis
      }
    }

    // Save lead to database
    const sql = neon(process.env.DATABASE_URL!);
    
    // FIXED: Don't double-stringify the AI analysis
    const result = await sql`
      INSERT INTO leads (name, email, phone, category, description, file_urls, company_id, ai_analysis)
      VALUES (
        ${name}, 
        ${email}, 
        ${phone}, 
        ${category}, 
        ${description}, 
        ${JSON.stringify(uploadedUrls)}, 
        ${company_id}, 
        ${aiAnalysis}
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
      leadId: result[0].id,
      aiAnalysis
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
