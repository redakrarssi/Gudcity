import { neon } from '@neondatabase/serverless';

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for API route
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract the program ID from the URL
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Program ID is required'
    });
  }

  // Handle GET request to fetch a specific program
  if (req.method === 'GET') {
    try {
      const program = await sql`
        SELECT * FROM loyalty_programs WHERE id = ${id}
      `;

      if (program.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty program not found'
        });
      }

      return res.status(200).json({
        success: true,
        program: program[0]
      });
    } catch (error) {
      console.error('Error fetching loyalty program:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching the loyalty program',
        error: error.message
      });
    }
  }

  // Handle PUT request to update a program
  if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        rules,
        active
      } = req.body;

      // Check if the program exists
      const existingProgram = await sql`
        SELECT * FROM loyalty_programs WHERE id = ${id}
      `;

      if (existingProgram.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty program not found'
        });
      }

      // Update the program
      const now = new Date().toISOString();
      
      await sql`
        UPDATE loyalty_programs
        SET
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          rules = COALESCE(${rules ? JSON.stringify(rules) : null}, rules),
          active = COALESCE(${active}, active),
          updated_at = ${now}
        WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: 'Loyalty program updated successfully'
      });
    } catch (error) {
      console.error('Error updating loyalty program:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the loyalty program',
        error: error.message
      });
    }
  }

  // Handle DELETE request to remove a program
  if (req.method === 'DELETE') {
    try {
      // Check if the program exists
      const existingProgram = await sql`
        SELECT * FROM loyalty_programs WHERE id = ${id}
      `;

      if (existingProgram.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty program not found'
        });
      }

      // Delete the program
      await sql`
        DELETE FROM loyalty_programs WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: 'Loyalty program deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting loyalty program:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the loyalty program',
        error: error.message
      });
    }
  }

  // If we reach here, the method is not supported
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  });
} 