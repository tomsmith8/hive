# Tests Directory

This directory contains all test files for the Hive application.

## Structure

```
src/__tests__/
├── setup.ts              # Global test setup
├── unit/                 # Unit tests
│   └── .gitkeep         # Placeholder
└── integration/          # Integration tests
    └── .gitkeep         # Placeholder
```

## Test Types

### Unit Tests (`unit/`)
- Test individual functions and components in isolation
- Mock external dependencies
- Fast execution
- Focus on specific functionality

### Integration Tests (`integration/`)
- Test how different parts work together
- May use real database connections
- Test API endpoints and workflows
- Slower but more comprehensive

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

## Test Setup

The `setup.ts` file configures the global test environment. Add any global setup, mocks, or configuration here. 