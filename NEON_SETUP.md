# Neon Database Setup Guide

This guide explains how to connect your Vite + React application to a Neon PostgreSQL database.

## Prerequisites

- A Vercel account connected to your application
- A Neon database project

## Steps to Connect

### 1. Install the Neon Serverless Driver

```bash
npm install @neondatabase/serverless
```

### 2. Pull Your Environment Variables from Vercel

```bash
vercel env pull .env.development.local
```

This will create a `.env.development.local` file with your environment variables, including the `DATABASE_URL` for Neon.

> Note: For Vite projects, environment variables need to be prefixed with `VITE_` to be accessible in the client code. You may need to rename `DATABASE_URL` to `VITE_DATABASE_URL` in your local file.

### 3. Create the Database Table

Navigate to the Neon SQL Editor in the Neon Console and create the application database by running this SQL command:

```sql
CREATE TABLE IF NOT EXISTS comments (comment TEXT);
```

You can access the Neon Console from the Storage tab on your Vercel Dashboard. Select "Open in Neon Console".

### 4. Using the CommentForm Component

The `CommentForm` component is already set up to insert and retrieve comments from your Neon database. You can import and use it in any page:

```jsx
import CommentForm from './components/CommentForm';

function App() {
  return (
    <div className="App">
      <h1>My App</h1>
      <CommentForm />
    </div>
  );
}
```

### 5. Running the App

Execute the following command to run your application locally:

```bash
npm run dev
```

Visit http://localhost:5173 (default Vite port) to see the comment form.

## Troubleshooting

- If you encounter connection issues, make sure your `VITE_DATABASE_URL` is correctly set in your `.env.development.local` file.
- Ensure you have created the `comments` table in your Neon database.
- Check the browser console for any error messages.

## Environment Variables

Create a `.env.development.local` file with the following content:

```
VITE_DATABASE_URL=postgres://username:password@host.neon.tech/database?sslmode=require
```

Replace the values with your actual Neon database credentials from Vercel.

## Additional Steps

### 1. Run the Setup Script

```bash
npm run setup-neon
```

This script will set up everything, including the environment variables, the database connection, and the comments table.

### 2. Run the Test Connection Script

```bash
npm run test-neon
```

This script will test the connection to your Neon database to ensure everything is set up correctly.

### 3. Run the Comprehensive Setup Script

```bash
npm run setup-neon
```

This script will run the setup script and then test the connection.

### 4. Run the App

```bash
npm run dev
```

This will run the app and open it in your default browser.

Visit http://localhost:5173/neon-demo to see the integration in action. 