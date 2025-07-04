# Hive - Fresh Start

This is a clean slate for your Hive application. The project structure is maintained but all complex logic has been removed.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── providers/             # React context providers
├── middleware/            # Next.js middleware
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── github/           # GitHub integration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── services/              # API services and business logic
├── store/                 # State management
└── __tests__/             # Test files
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment: `npm run setup`
3. Start development server: `npm run dev`

## Next Steps

1. Add your authentication logic to `src/lib/auth/`
2. Create your components in `src/components/`
3. Set up your API routes in `src/app/api/`
4. Add your business logic to `src/services/`
5. Configure your middleware in `src/middleware/` 