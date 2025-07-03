# TypeScript Development Rules

## Type Definitions
- Always define interfaces for component props
- Use type aliases for complex types
- Prefer interfaces over type aliases for object shapes
- Use union types for values that can be multiple types
- Use literal types for specific string/number values

## Type Safety
- Avoid using `any` type - use `unknown` instead
- Use proper generic types when needed
- Define return types for functions when not obvious
- Use type guards for runtime type checking
- Leverage TypeScript's built-in utility types

## Common Patterns
- Use `Partial<T>` for optional properties
- Use `Pick<T, K>` to select specific properties
- Use `Omit<T, K>` to exclude specific properties
- Use `Record<K, V>` for object types with dynamic keys
- Use `NonNullable<T>` to exclude null/undefined

## API Types
- Define types for API responses
- Use zod or similar for runtime validation
- Create separate type files for API schemas
- Use discriminated unions for different response types

## Example Type Definitions:
```tsx
// Component props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// API response types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Utility types
type UserWithoutId = Omit<User, 'id'>;
type UserUpdate = Partial<UserWithoutId>;
type UserRoles = User['role'];
``` 