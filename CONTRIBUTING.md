# Contributing to GudCity Loyalty

Thank you for considering contributing to GudCity Loyalty! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help us maintain a healthy and welcoming community.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:

1. Check the issue tracker to see if the bug has already been reported.
2. If you can't find an open issue addressing the problem, open a new one.

When reporting bugs, please include:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Screenshots if applicable
- System information (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome. Please include:

- A clear and descriptive title
- A detailed description of the suggested enhancement
- Examples of how this enhancement would be useful
- Mockups or wireframes if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests as necessary
5. Run existing tests to ensure nothing was broken
6. Submit a pull request against the `main` branch

## Development Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gudcity-loyalty.git
   cd gudcity-loyalty
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment variables file:
   ```
   cp .env.example .env
   ```

4. Set up Supabase:
   - Create a Supabase project
   - Run the database initialization script in `/src/sql/database_setup.sql`
   - Update your `.env` file with your Supabase credentials

5. Start the development server:
   ```
   npm run dev
   ```

## Coding Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Write meaningful commit messages
- Comment your code when necessary
- Update documentation when changing functionality

## Testing

- Write tests for new features or bug fixes
- Run existing tests before submitting a pull request
- Ensure all tests pass

## Documentation

- Update README.md with any new features
- Document all new functions and components
- Keep API documentation up to date

Thank you for contributing to GudCity Loyalty! 