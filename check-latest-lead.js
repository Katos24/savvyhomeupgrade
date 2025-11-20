const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkLatestLead() {
  const sql = neon(process.env.DATABASE_URL);
  const leads = await sql`
    SELECT id, name, email, category, created_at, company_id, 
           file_urls, ai_analysis 
    FROM leads 
    ORDER BY created_at DESC 
    LIMIT 3
  `;
  
  console.log('\n=== Latest 3 Leads ===\n');
  leads.forEach(lead => {
    console.log(`\n--- Lead ID: ${lead.id} ---`);
    console.log(`Name: ${lead.name}`);
    console.log(`Email: ${lead.email}`);
    console.log(`Category: ${lead.category}`);
    console.log(`Company ID: ${lead.company_id}`);
    console.log(`Created: ${lead.created_at}`);
    console.log(`File URLs type: ${typeof lead.file_urls}`);
    console.log(`File URLs: ${lead.file_urls ? JSON.stringify(lead.file_urls).substring(0, 200) : 'NULL'}`);
    console.log(`AI Analysis type: ${typeof lead.ai_analysis}`);
    console.log(`AI Analysis: ${lead.ai_analysis ? JSON.stringify(lead.ai_analysis).substring(0, 200) : 'NULL'}`);
  });
}

checkLatestLead().catch(console.error);
