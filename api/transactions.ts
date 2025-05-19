import type { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { sql } from '../src/services/neonService';
import type { Tables } from '../src/models/database.types';

/**
 * Get transactions for a business
 * GET /api/transactions?businessId=123&limit=10&offset=0
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    const { 
      businessId, 
      customerId, 
      type,
      limit = 20, 
      offset = 0,
      sortBy = 'date',
      sortDirection = 'desc'
    } = req.query;
    
    // Validate required parameters
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    // Build query conditions
    let query = `
      SELECT t.*, 
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        lp.name as program_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN loyalty_programs lp ON t.program_id = lp.id
      WHERE t.business_id = '${businessId}'
    `;
    
    // Add optional filters
    if (customerId) {
      query += ` AND t.customer_id = '${customerId}'`;
    }
    
    if (type) {
      query += ` AND t.type = '${type}'`;
    }
    
    // Add sorting and pagination
    const validSortColumns = ['date', 'amount', 'points_earned', 'created_at'];
    const orderBy = validSortColumns.includes(sortBy as string) ? sortBy : 'date';
    const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY t.${orderBy} ${direction}
               LIMIT ${limit} OFFSET ${offset}`;
    
    const transactions = await sql.query(query);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.business_id = '${businessId}'
      ${customerId ? ` AND t.customer_id = '${customerId}'` : ''}
      ${type ? ` AND t.type = '${type}'` : ''}
    `;
    
    const countResult = await sql.query(countQuery);
    const total = parseInt(countResult[0].total);
    
    return res.status(200).json({
      success: true,
      transactions,
      total,
      page: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
export async function getTransactionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT t.*, 
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.email as customer_email,
        lp.name as program_name,
        lp.type as program_type,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN loyalty_programs lp ON t.program_id = lp.id
      LEFT JOIN users u ON t.staff_id = u.id
      WHERE t.id = '${id}'
    `;
    
    const transactions = await sql.query(query);
    
    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    return res.status(200).json({
      success: true,
      transaction: transactions[0]
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Create a new transaction
 * POST /api/transactions
 */
export async function createTransaction(req: Request, res: Response) {
  try {
    const { 
      businessId, 
      customerId, 
      programId = null, 
      amount, 
      pointsEarned = 0,
      type = 'purchase',
      staffId = null,
      notes = null,
      receiptNumber = null,
      date = new Date().toISOString()
    } = req.body;
    
    // Validate required fields
    if (!businessId || !customerId || amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Business ID, customer ID, and amount are required' 
      });
    }
    
    // Validate transaction type
    const validTypes = ['purchase', 'refund', 'reward_redemption'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Start transaction
    await sql`BEGIN`;
    
    try {
      const transactionId = nanoid();
      const now = new Date().toISOString();
      
      // Create transaction record
      await sql`
        INSERT INTO transactions (
          id, business_id, customer_id, program_id, amount, points_earned,
          date, type, staff_id, notes, receipt_number, created_at, updated_at
        ) VALUES (
          ${transactionId}, ${businessId}, ${customerId}, ${programId}, 
          ${amount}, ${pointsEarned}, ${date}, ${type}, ${staffId}, 
          ${notes}, ${receiptNumber}, ${now}, ${now}
        )
      `;
      
      // If transaction is a purchase and points are earned, update customer points
      if (type === 'purchase' && pointsEarned > 0) {
        // Update total customer points
        await sql`
          UPDATE customers
          SET total_points = total_points + ${pointsEarned},
              updated_at = ${now}
          WHERE id = ${customerId}
        `;
        
        // If program is specified, update loyalty card points
        if (programId) {
          // Check if customer has a loyalty card for this program
          const cards = await sql`
            SELECT id FROM loyalty_cards
            WHERE customer_id = ${customerId}
            AND program_id = ${programId}
          `;
          
          if (cards.length > 0) {
            // Update existing card
            const cardId = cards[0].id;
            
            await sql`
              UPDATE loyalty_cards
              SET points_balance = points_balance + ${pointsEarned},
                  updated_at = ${now}
              WHERE id = ${cardId}
            `;
            
            // For punchcard programs, increment punch count
            const programs = await sql`
              SELECT type FROM loyalty_programs
              WHERE id = ${programId}
            `;
            
            if (programs.length > 0 && programs[0].type === 'punchcard') {
              await sql`
                UPDATE loyalty_cards
                SET punch_count = COALESCE(punch_count, 0) + 1,
                    updated_at = ${now}
                WHERE id = ${cardId}
              `;
            }
          } else {
            // Create new loyalty card for customer
            const programs = await sql`
              SELECT type FROM loyalty_programs
              WHERE id = ${programId}
            `;
            
            if (programs.length > 0) {
              const programType = programs[0].type;
              
              await sql`
                INSERT INTO loyalty_cards (
                  id, business_id, customer_id, program_id,
                  points_balance, punch_count, tier, issue_date,
                  active, created_at, updated_at
                ) VALUES (
                  ${nanoid()}, ${businessId}, ${customerId}, ${programId},
                  ${pointsEarned}, 
                  ${programType === 'punchcard' ? 1 : null},
                  ${programType === 'tiered' ? 'Bronze' : null},
                  ${now}, true, ${now}, ${now}
                )
              `;
            }
          }
        }
      }
      
      // If transaction is a refund, deduct points
      if (type === 'refund' && pointsEarned > 0) {
        // Update total customer points
        await sql`
          UPDATE customers
          SET total_points = GREATEST(0, total_points - ${pointsEarned}),
              updated_at = ${now}
          WHERE id = ${customerId}
        `;
        
        // If program is specified, update loyalty card points
        if (programId) {
          await sql`
            UPDATE loyalty_cards
            SET points_balance = GREATEST(0, points_balance - ${pointsEarned}),
                updated_at = ${now}
            WHERE customer_id = ${customerId}
            AND program_id = ${programId}
          `;
        }
      }
      
      // Commit transaction
      await sql`COMMIT`;
      
      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        transactionId
      });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
export async function deleteTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if transaction exists
    const transactions = await sql`
      SELECT * FROM transactions WHERE id = ${id}
    `;
    
    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // Delete transaction
    await sql`
      DELETE FROM transactions WHERE id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default {
  getTransactions,
  getTransactionById,
  createTransaction,
  deleteTransaction
}; 