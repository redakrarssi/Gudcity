import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { sql } from '../src/services/neonService';
import { Tables } from '../src/models/database.types';

/**
 * Get all loyalty programs for a business
 * GET /api/programs?businessId=123
 */
export async function getPrograms(req: Request, res: Response) {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    const programs = await sql`
      SELECT * FROM loyalty_programs 
      WHERE business_id = ${businessId as string}
      ORDER BY created_at DESC
    `;
    
    return res.status(200).json({
      success: true,
      programs
    });
  } catch (error) {
    console.error('Error getting programs:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get a single loyalty program by ID
 * GET /api/programs/:id
 */
export async function getProgramById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const programs = await sql`
      SELECT * FROM loyalty_programs WHERE id = ${id}
    `;
    
    if (programs.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    const program = programs[0];
    
    // Get associated rewards
    const rewards = await sql`
      SELECT * FROM rewards WHERE program_id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      program,
      rewards
    });
  } catch (error) {
    console.error('Error getting program:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Create a new loyalty program
 * POST /api/programs
 */
export async function createProgram(req: Request, res: Response) {
  try {
    const { 
      businessId, 
      name, 
      type, 
      description, 
      rules,
      active = true,
      startDate,
      endDate
    } = req.body;
    
    // Validate required fields
    if (!businessId || !name || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Business ID, name, and type are required' 
      });
    }
    
    // Validate program type
    const validTypes = ['points', 'punchcard', 'tiered'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Validate rules based on program type
    if (type === 'points' && (!rules || typeof rules.pointsPerDollar !== 'number')) {
      return res.status(400).json({
        success: false,
        message: 'Points program requires pointsPerDollar rule'
      });
    }
    
    if (type === 'punchcard' && (!rules || typeof rules.punchesNeeded !== 'number')) {
      return res.status(400).json({
        success: false,
        message: 'Punchcard program requires punchesNeeded rule'
      });
    }
    
    if (type === 'tiered' && (!rules || !Array.isArray(rules.tiers) || rules.tiers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tiered program requires tiers rule with at least one tier'
      });
    }
    
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Create program
    await sql`
      INSERT INTO loyalty_programs (
        id, business_id, name, type, description, rules, 
        active, start_date, end_date, created_at, updated_at
      ) VALUES (
        ${id}, ${businessId}, ${name}, ${type}, ${description || null}, 
        ${JSON.stringify(rules)}, ${active}, ${startDate || null}, ${endDate || null}, 
        ${now}, ${now}
      )
    `;
    
    return res.status(201).json({
      success: true,
      message: 'Loyalty program created successfully',
      programId: id
    });
  } catch (error) {
    console.error('Error creating program:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update a loyalty program
 * PUT /api/programs/:id
 */
export async function updateProgram(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      rules,
      active,
      startDate,
      endDate
    } = req.body;
    
    // Check if program exists
    const programs = await sql`
      SELECT * FROM loyalty_programs WHERE id = ${id}
    `;
    
    if (programs.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    // Prepare update fields
    const updates: Partial<Tables['loyalty_programs']> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (rules !== undefined) updates.rules = rules;
    if (active !== undefined) updates.active = active;
    if (startDate !== undefined) updates.start_date = startDate;
    if (endDate !== undefined) updates.end_date = endDate;
    updates.updated_at = new Date().toISOString();
    
    // Generate SQL SET clause
    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
      .join(', ');
    
    // Update program
    await sql`
      UPDATE loyalty_programs
      SET ${sql(setClause)}
      WHERE id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete a loyalty program
 * DELETE /api/programs/:id
 */
export async function deleteProgram(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if program exists
    const programs = await sql`
      SELECT * FROM loyalty_programs WHERE id = ${id}
    `;
    
    if (programs.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    // Delete program - this will cascade to rewards and loyalty cards
    await sql`
      DELETE FROM loyalty_programs WHERE id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
}; 