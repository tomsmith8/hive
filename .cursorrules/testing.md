# Testing Development Rules

## Test Structure
- Use Jest as the testing framework
- Use React Testing Library for component tests
- Place tests in `__tests__` directories or alongside files
- Use descriptive test names that explain the behavior
- Follow the AAA pattern: Arrange, Act, Assert

## Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText, etc.)
- Test accessibility features
- Mock external dependencies
- Test error states and loading states

## API Testing
- Test API routes with proper HTTP methods
- Mock database operations
- Test error handling
- Validate response formats
- Test authentication and authorization

## Test Organization
- Group related tests with describe blocks
- Use beforeEach for common setup
- Clean up after tests with afterEach
- Use test utilities for common operations
- Keep tests focused and isolated

## Example Component Test:
```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Example API Test:
```tsx
// __tests__/api/users.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns users successfully', async () => {
      const mockUsers = [{ id: '1', name: 'John', email: 'john@example.com' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual(mockUsers);
    });

    it('handles database errors', async () => {
      (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch users');
    });
  });
});
```

## Testing Utilities:
```tsx
// __tests__/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
``` 