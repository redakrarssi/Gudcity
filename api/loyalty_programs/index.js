import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Support GET and POST methods for listing and creating loyalty programs
  if (req.method === 'GET') {
    try {
      const { business_id } = req.query;
      
      if (!business_id) {
        return res.status(400).json({ error: 'Business ID is required' });
      }
      
      const programs = await sql`
        SELECT * FROM loyalty_programs 
        WHERE business_id = ${business_id}
        ORDER BY created_at DESC
      `;
      
      return res.status(200).json({ 
        success: true, 
        programs 
      });
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching loyalty programs:', error);
      
      // Return appropriate error response
      return res.status(500).json({ 
        error: 'Failed to fetch loyalty programs', 
        detail: error.message 
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        business_id, 
        name, 
        description, 
        points_per_dollar,
        start_date,
        end_date 
      } = req.body;

      // Validate required fields
      if (!business_id) {
        return res.status(400).json({ error: 'Business ID is required' });
      }
      
      if (!name) {
        return res.status(400).json({ error: 'Program name is required' });
      }

      // Default points_per_dollar to 1 if not provided or invalid
      const pointsPerDollar = points_per_dollar && !isNaN(parseFloat(points_per_dollar)) 
        ? parseFloat(points_per_dollar) 
        : 1.0;
      
      // Use current date for start_date if not provided
      const programStartDate = start_date || new Date().toISOString().split('T')[0];
      
      // Insert loyalty program into database
      const newProgram = await sql`
        INSERT INTO loyalty_programs (
          business_id,
          name,
          description,
          points_per_dollar,
          start_date,
          end_date,
          created_at,
          updated_at
        ) 
        VALUES (
          ${business_id},
          ${name},
          ${description || ''},
          ${pointsPerDollar},
          ${programStartDate},
          ${end_date || null},
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      // Return success response with created loyalty program
      return res.status(201).json({
        success: true,
        message: 'Loyalty program created successfully',
        program: newProgram[0]
      });
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating loyalty program:', error);
      
      // Return appropriate error response
      return res.status(500).json({ 
        error: 'Failed to insert loyalty program', 
        detail: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 