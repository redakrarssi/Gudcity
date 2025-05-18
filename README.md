# GudCity Loyalty

A loyalty program management platform.

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

## Getting Started

```bash
# Install dependencies
npm install

# Pull environment variables from Vercel (if using Vercel)
vercel env pull .env.development.local

# Start the development server
npm run dev
```

## Building for Production

```bash
npm run build
```

This will generate optimized production files in the `dist` directory. 