# Database Development Rules

## Prisma Schema
- Use descriptive model and field names
- Add proper field types and constraints
- Use enums for fixed value sets
- Add proper indexes for performance
- Include proper relationships between models

## Database Operations
- Always handle database errors gracefully
- Use transactions for multi-step operations
- Implement proper validation before database operations
- Use Prisma's built-in validation features
- Cache frequently accessed data when appropriate

## Query Optimization
- Use select to fetch only needed fields
- Use include for related data when necessary
- Implement pagination for large datasets
- Use proper where clauses for filtering
- Avoid N+1 query problems

## Migration Management
- Create migrations for all schema changes
- Test migrations in development before production
- Use descriptive migration names
- Review migration files before applying
- Keep migrations atomic and focused

## Example Prisma Usage:
```tsx
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

```tsx
// Example service function
export async function getUserWithPosts(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user data');
  }
}
```

## Schema Example:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts Post[]
  
  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  author User @relation(fields: [authorId], references: [id])
  
  @@map("posts")
}

enum UserRole {
  USER
  ADMIN
}
``` 