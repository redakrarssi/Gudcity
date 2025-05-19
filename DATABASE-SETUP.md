# Neon Database Integration Guide

This guide explains how to set up and connect the application to Neon's serverless PostgreSQL database.

## Prerequisites

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project in the Neon dashboard
3. Get your connection string from the Neon dashboard

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in the project root (if it doesn't already exist) and add your Neon connection string:

```
VITE_DATABASE_URL=postgresql://username:password@ep-example-endpoint.region.aws.neon.tech/database?sslmode=require
```

Replace the connection string with your actual Neon connection details.

### 2. Initialize Database Schema

Run the setup script to create all needed database tables:

```bash
npm run setup-db
```

This script will execute the SQL in `src/sql/database_setup.sql` to create the necessary tables and functions.

### 3. Create the Comments Table

To create the comments table specifically:

```bash
npm run create-comments-table
```

### 4. Test the Connection

To verify that your connection is working properly:

```bash
npm run test-neon
```

This will check that the database is accessible and show the current tables.

### 5. Seed the Database (Optional)

To populate the database with sample data:

```bash
npm run seed-db
```

## Services Structure

The application uses the following service structure to interact with the database:

- `dbService.ts` - Core database functions (CRUD operations)
- `businessService.ts` - Business-related operations
- `userService.ts` - User management operations
- `customerService.ts` - Customer operations
- `loyaltyProgramService.ts` - Loyalty program operations
- `transactionService.ts` - Transaction operations
- `rewardService.ts` - Reward operations
- `authService.ts` - Authentication operations

## Using the Services

Import services from the central service index:

```typescript
import { 
  getUserById, 
  createBusiness, 
  getBusinessCustomers,
  loyaltyProgramService,
  rewardService,
  recordPurchase,
  authenticateUser 
} from '../services';
```

### Example: Creating a Business

```typescript
import { createBusiness } from '../services';

const newBusiness = await createBusiness({
  name: 'Coffee Shop',
  owner_id: userId,
  address: '123 Main St',
  phone: '555-123-4567',
  email: 'info@coffeeshop.com',
  website: 'https://coffeeshop.com',
  description: 'A cozy coffee shop'
});
```

### Example: Recording a Purchase Transaction

```typescript
import { recordPurchase } from '../services';

await recordPurchase({
  businessId: 'business-id',
  customerId: 'customer-id',
  programId: 'loyalty-program-id',
  amount: 25.99,
  pointsEarned: 26, // 1 point per dollar
  staffId: 'staff-id',
  receiptNumber: '1001'
});
```

## Troubleshooting

### Connection Issues

1. Check your `.env` file to ensure the connection string is correct
2. Verify that your IP address is allowed in Neon's connection settings
3. Ensure SSL is enabled in the connection string (`sslmode=require`)

### Table Creation Errors

If you encounter errors during table creation:

1. Check if the tables already exist in your database
2. Look for SQL syntax errors in the setup script
3. Try running the SQL statements directly in Neon's SQL Editor

### Data Retrieval Issues

1. Check your service functions for correct table names and field names
2. Verify that your queries are properly formatted
3. Test simple queries first to isolate the problem

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [@neondatabase/serverless Package](https://www.npmjs.com/package/@neondatabase/serverless)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 