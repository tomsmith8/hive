# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for your Hive project.

## Overview

The implementation uses NextAuth.js with GitHub OAuth provider, integrated with your existing Prisma schema. This provides:

- ✅ Secure OAuth flow with CSRF protection
- ✅ Token hashing for security
- ✅ Session management
- ✅ User profile data storage
- ✅ TypeScript support
- ✅ Database integration

## Prerequisites

1. **GitHub OAuth App**: You need to create a GitHub OAuth application
2. **Environment Variables**: Configure the required environment variables
3. **Database**: Ensure your PostgreSQL database is running

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Hive Development` (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hive_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Step 3: Install Dependencies

The required dependencies are already installed:

- `next-auth@4` - Authentication framework
- `@auth/prisma-adapter` - Prisma adapter for NextAuth
- `bcryptjs` - Token hashing
- `@types/bcryptjs` - TypeScript types

## Step 4: Database Setup

1. Run database migrations:
```bash
npx prisma migrate dev
```

2. Generate Prisma client:
```bash
npx prisma generate
```

## Step 5: Test the Implementation

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000`
3. Click "Login with GitHub"
4. Complete the OAuth flow
5. You should be redirected to `/dashboard` with your GitHub profile information

## Implementation Details

### Files Created/Modified

1. **`src/lib/auth/nextauth.ts`** - NextAuth configuration
2. **`src/app/api/auth/[...nextauth]/route.ts`** - API route handler
3. **`src/components/LoginButton.tsx`** - Login/logout component
4. **`src/providers/SessionProvider.tsx`** - Session provider wrapper
5. **`src/app/layout.tsx`** - Updated to include SessionProvider
6. **`src/app/page.tsx`** - Updated to include LoginButton
7. **`src/app/dashboard/page.tsx`** - Protected dashboard page

### Security Features

- **Token Hashing**: Access tokens are hashed with bcrypt before storage
- **CSRF Protection**: State parameter validation
- **Secure Cookies**: HTTP-only, secure cookies for sessions
- **Database Sessions**: Sessions stored in database with expiration

### Data Storage

The implementation stores:

- **User Profile**: Name, email, avatar from GitHub
- **GitHub Data**: Username, bio, company, location, etc.
- **OAuth Tokens**: Hashed access tokens
- **Session Data**: User sessions with expiration

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check your GitHub OAuth app credentials
2. **Database connection errors**: Ensure PostgreSQL is running and DATABASE_URL is correct
3. **Session not persisting**: Check NEXTAUTH_SECRET is set correctly

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
DEBUG=next-auth:*
```

## Production Deployment

For production deployment:

1. Update GitHub OAuth app URLs:
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

2. Update environment variables:
   - `NEXTAUTH_URL`: `https://yourdomain.com`
   - `DATABASE_URL`: Your production database URL

3. Ensure all environment variables are set in your hosting platform

## Next Steps

After successful OAuth setup, you can:

1. Add more OAuth providers (Google, Discord, etc.)
2. Implement role-based access control
3. Add user profile management
4. Create protected API routes
5. Add organization/team features

## Support

If you encounter issues:

1. Check the [NextAuth.js documentation](https://next-auth.js.org/)
2. Review the [GitHub OAuth documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
3. Check the browser console and server logs for errors 