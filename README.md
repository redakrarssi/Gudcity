# GudCity Loyalty System

A comprehensive loyalty program management system built with React, TypeScript, and PostgreSQL (via Neon).

## Features

- **User Management**: Registration, authentication, and role-based access control
- **Business Management**: Create and manage businesses
- **Customer Management**: Track customer information and loyalty status
- **Loyalty Programs**: Create and manage different types of loyalty programs
  - Points-based programs
  - Punchcard programs
  - Tiered loyalty programs
- **Transaction Processing**: Record purchases and automatically calculate points
- **Reward Redemption**: Create and redeem rewards using earned points
- **QR Code Generation**: Create and scan QR codes for various purposes
- **Analytics & Reporting**: Track customer engagement and program performance

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom JWT implementation
- **QR Code**: QRCode.react for generation, html5-qrcode for scanning

## Project Structure

```
├── api/                  # API routes
│   ├── users.ts          # User management endpoints
│   ├── customers.ts      # Customer management endpoints
│   ├── programs.ts       # Loyalty program endpoints
│   ├── transactions.ts   # Transaction endpoints
│   └── qr.ts             # QR code endpoints
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── loyalty/      # Loyalty-specific components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts
│   ├── middleware/       # Express middleware
│   ├── models/           # TypeScript interfaces and types
│   ├── pages/            # React pages
│   │   ├── admin/        # Admin pages
│   │   ├── auth/         # Authentication pages
│   │   ├── customer/     # Customer portal pages
│   │   └── dashboard/    # Business dashboard pages
│   ├── services/         # Service layer for API interactions
│   │   ├── neonService.ts # Database connection service
│   │   └── dbService.ts  # Generic database operations
│   └── utils/            # Utility functions
│       └── auth.ts       # Authentication utilities
├── public/               # Static assets
└── sql/                  # SQL scripts
    └── database_setup.sql # Database schema
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.development.local` file with your Neon database credentials:
   ```
   VITE_DATABASE_URL=postgresql://username:password@hostname/database
   ```
4. Run the database setup script: `npm run setup-db`
5. Start the development server: `npm run dev`

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Customers
- `GET /api/customers` - Get customers for a business
- `GET /api/customers/:id` - Get a single customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Loyalty Programs
- `GET /api/programs` - Get all loyalty programs for a business
- `GET /api/programs/:id` - Get a single loyalty program
- `POST /api/programs` - Create a new loyalty program
- `PUT /api/programs/:id` - Update a loyalty program
- `DELETE /api/programs/:id` - Delete a loyalty program

### Transactions
- `GET /api/transactions` - Get transactions for a business
- `GET /api/transactions/:id` - Get a single transaction
- `POST /api/transactions` - Create a new transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### QR Codes
- `POST /api/qr/generate` - Generate a new QR code
- `GET /api/qr` - Get QR codes for a business
- `GET /api/qr/:id` - Get a QR code by ID
- `POST /api/qr/scan` - Process QR code scan
- `DELETE /api/qr/:id` - Delete a QR code

## Todo

- [ ] Implement proper authentication with JWT
- [ ] Add Express server setup
- [ ] Create React Router configuration
- [ ] Add form validation with Zod
- [ ] Implement proper error handling
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add documentation with Swagger/OpenAPI
- [ ] Implement real-time notifications
- [ ] Add mobile responsiveness
- [ ] Implement offline support with service workers

## New Feature: Neon Database Integration

We've integrated Neon PostgreSQL database with our application. Here's what's been added:

- Neon serverless driver for database connection
- Database service layer in `src/services/neonService.ts`
- Comment form component in `src/components/CommentForm.tsx`
- Demo page at `/neon-demo` to showcase the database integration

For detailed setup instructions, please see [NEON_SETUP.md](./NEON_SETUP.md).

## Environment Setup

Make sure to create a `.env.development.local` file with your Neon database connection string:

```
VITE_DATABASE_URL=postgres://username:password@host.neon.tech/database?sslmode=require
```

You can get this URL from your Vercel project settings.

## Recent Updates

- Fixed infinite loading screen issue with improved error handling
- Added database connection error recovery mechanism
- Implemented mock data fallback when database is unavailable
- Fixed HTML5 QR Code library integrity issues

## Building for Production

```bash
npm run build
```

This will generate optimized production files in the `dist` directory. 