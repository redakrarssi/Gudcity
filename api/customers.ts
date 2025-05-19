import type { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { sql } from '../src/services/neonService';

/**
 * Get customers for a business
 * GET /api/customers?businessId=123&limit=10&offset=0
 */
export async function getCustomers(req: Request, res: Response) {
  try {
    const { 
      businessId, 
      search,
      limit = 20, 
      offset = 0,
      sortBy = 'sign_up_date',
      sortDirection = 'desc'
    } = req.query;
    
    // Validate required parameters
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    // Build query conditions
    let query = `
      SELECT c.*, 
        u.email as user_email,
        COALESCE(
          (SELECT COUNT(*) FROM transactions t WHERE t.customer_id = c.id), 
          0
        ) as transaction_count,
        COALESCE(
          (SELECT COUNT(*) FROM loyalty_cards lc WHERE lc.customer_id = c.id AND lc.active = true), 
          0
        ) as active_programs_count
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.business_id = '${businessId}'
    `;
    
    // Add search filter if provided
    if (search) {
      query += `
        AND (
          LOWER(c.first_name) LIKE LOWER('%${search}%') OR
          LOWER(c.last_name) LIKE LOWER('%${search}%') OR
          LOWER(c.email) LIKE LOWER('%${search}%') OR
          LOWER(c.phone) LIKE LOWER('%${search}%')
        )
      `;
    }
    
    // Add sorting and pagination
    const validSortColumns = ['first_name', 'last_name', 'email', 'sign_up_date', 'total_points'];
    const orderBy = validSortColumns.includes(sortBy as string) ? sortBy : 'sign_up_date';
    const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY c.${orderBy} ${direction}
               LIMIT ${limit} OFFSET ${offset}`;
    
    const customers = await sql.query(query);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customers c
      WHERE c.business_id = '${businessId}'
      ${search ? `
        AND (
          LOWER(c.first_name) LIKE LOWER('%${search}%') OR
          LOWER(c.last_name) LIKE LOWER('%${search}%') OR
          LOWER(c.email) LIKE LOWER('%${search}%') OR
          LOWER(c.phone) LIKE LOWER('%${search}%')
        )
      ` : ''}
    `;
    
    const countResult = await sql.query(countQuery);
    const total = parseInt(countResult[0].total);
    
    return res.status(200).json({
      success: true,
      customers,
      total,
      page: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total
      }
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get a single customer by ID
 * GET /api/customers/:id
 */
export async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Get basic customer info
    const customers = await sql`
      SELECT c.*, u.email as user_email
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ${id}
    `;
    
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const customer = customers[0];
    
    // Get loyalty cards
    const cards = await sql`
      SELECT lc.*, lp.name as program_name, lp.type as program_type
      FROM loyalty_cards lc
      JOIN loyalty_programs lp ON lc.program_id = lp.id
      WHERE lc.customer_id = ${id}
    `;
    
    // Get recent transactions (last 5)
    const transactions = await sql`
      SELECT t.*, lp.name as program_name
      FROM transactions t
      LEFT JOIN loyalty_programs lp ON t.program_id = lp.id
      WHERE t.customer_id = ${id}
      ORDER BY t.date DESC
      LIMIT 5
    `;
    
    // Get transaction stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_spent,
        COALESCE(SUM(points_earned), 0) as total_points_earned
      FROM transactions
      WHERE customer_id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      customer,
      cards,
      transactions,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Create a new customer
 * POST /api/customers
 */
export async function createCustomer(req: Request, res: Response) {
  try {
    const { 
      businessId,
      firstName,
      lastName,
      email,
      phone,
      address,
      birthday,
      notes
    } = req.body;
    
    // Validate required fields
    if (!businessId || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Business ID, first name, and last name are required' 
      });
    }
    
    // Check if customer with same email already exists for this business
    if (email) {
      const existingCustomers = await sql`
        SELECT id FROM customers
        WHERE business_id = ${businessId}
        AND email = ${email}
      `;
      
      if (existingCustomers.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'A customer with this email already exists' 
        });
      }
    }
    
    const customerId = nanoid();
    const now = new Date().toISOString();
    
    // Create customer record
    await sql`
      INSERT INTO customers (
        id, business_id, first_name, last_name, email, phone,
        address, sign_up_date, total_points, birthday, notes,
        created_at, updated_at
      ) VALUES (
        ${customerId}, ${businessId}, ${firstName}, ${lastName}, 
        ${email || null}, ${phone || null}, ${address || null},
        ${now}, 0, ${birthday || null}, ${notes || null}, 
        ${now}, ${now}
      )
    `;
    
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customerId
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update a customer
 * PUT /api/customers/:id
 */
export async function updateCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { 
      firstName,
      lastName,
      email,
      phone,
      address,
      birthday,
      notes,
      totalPoints
    } = req.body;
    
    // Check if customer exists
    const customers = await sql`
      SELECT * FROM customers WHERE id = ${id}
    `;
    
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const customer = customers[0];
    
    // Build update query with only changed fields
    const updates = [];
    const params = [id];
    let paramIndex = 2;
    
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(lastName);
    }
    
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      params.push(address);
    }
    
    if (birthday !== undefined) {
      updates.push(`birthday = $${paramIndex++}`);
      params.push(birthday);
    }
    
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }
    
    if (totalPoints !== undefined) {
      updates.push(`total_points = $${paramIndex++}`);
      params.push(totalPoints);
    }
    
    // Add updated_at timestamp
    updates.push(`updated_at = $${paramIndex++}`);
    params.push(new Date().toISOString());
    
    // If no updates, return success
    if (updates.length === 1) { // Only updated_at
      return res.status(200).json({
        success: true,
        message: 'No changes to update'
      });
    }
    
    const updateQuery = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $1
    `;
    
    await sql.query(updateQuery, params);
    
    // If email updated and customer has a user account, update user email too
    if (email !== undefined && customer.user_id) {
      await sql`
        UPDATE users
        SET email = ${email}, updated_at = ${new Date().toISOString()}
        WHERE id = ${customer.user_id}
      `;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete a customer
 * DELETE /api/customers/:id
 */
export async function deleteCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customers = await sql`
      SELECT * FROM customers WHERE id = ${id}
    `;
    
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    // Start transaction
    await sql`BEGIN`;
    
    try {
      const customer = customers[0];
      
      // Delete all loyalty cards
      await sql`
        DELETE FROM loyalty_cards WHERE customer_id = ${id}
      `;
      
      // Delete all transactions
      await sql`
        DELETE FROM transactions WHERE customer_id = ${id}
      `;
      
      // Delete customer
      await sql`
        DELETE FROM customers WHERE id = ${id}
      `;
      
      // If customer has a user account, delete that too
      if (customer.user_id) {
        await sql`
          DELETE FROM users WHERE id = ${customer.user_id}
        `;
      }
      
      // Commit transaction
      await sql`COMMIT`;
      
      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
}; 