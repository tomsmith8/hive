# Simplified Service Architecture

This directory contains a clean, minimal service architecture for handling external API requests. The architecture focuses on the two essential operations:

- **createProject** (Stakwork) - Create new projects
- **createPool** (Pool Manager) - Create new pools

## Architecture Overview

```
src/
├── lib/
│   ├── http-client.ts    # Base HTTP client with native fetch
│   └── env.ts           # Environment validation
├── services/
│   ├── stakwork.ts      # Stakwork service (createProject only)
│   ├── pool-manager.ts  # Pool Manager service (createPool only)
│   ├── index.ts         # Service exports
│   └── README.md        # This documentation
└── app/api/
    ├── stakwork/create-project/route.ts
    └── pool-manager/create-pool/route.ts
```

## Environment Configuration

Add the following to your `.env.local`:

```env
# Required API Keys
STAKWORK_API_KEY="your-stakwork-api-key-here"
POOL_MANAGER_API_KEY="your-pool-manager-api-key-here"

# Optional Configuration (with defaults)
STAKWORK_BASE_URL="https://jobs.stakwork.com/api/v1"
POOL_MANAGER_BASE_URL="https://workspaces.sphinx.chat/api"
API_TIMEOUT="10000"
```

## Available Operations

### 1. Create Stakwork Project

```typescript
import { stakworkService } from '@/services';

const project = await stakworkService.createProject({
  title: 'New Project',
  description: 'Project description',
  budget: { min: 1000, max: 5000, currency: 'USD' },
  skills: ['TypeScript', 'React']
});
```

**API Endpoint:** `POST /api/stakwork/create-project`

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "budget": {
    "min": 1000,
    "max": 5000,
    "currency": "USD"
  },
  "skills": ["TypeScript", "React"]
}
```

### 2. Create Pool Manager Pool

```typescript
import { poolManagerService } from '@/services';

const pool = await poolManagerService.createPool({
  name: 'Pool Name',
  description: 'Pool description',
  members: ['user1', 'user2']
});
```

**API Endpoint:** `POST /api/pool-manager/create-pool`

**Request Body:**
```json
{
  "name": "Pool Name",
  "description": "Pool description",
  "members": ["user1", "user2"]
}
```

## Usage Examples

### 1. In API Routes

```typescript
// src/app/api/stakwork/create-project/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stakworkService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await stakworkService.createProject(body);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/pool-manager/create-pool/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { poolManagerService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pool = await poolManagerService.createPool(body);
    return NextResponse.json({ pool }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create pool' },
      { status: 500 }
    );
  }
}
```

### 2. In Server Components

```typescript
// src/app/create-project/page.tsx
import { stakworkService } from '@/services';

export default async function CreateProjectPage() {
  const handleCreate = async (formData: FormData) => {
    'use server';
    
    const project = await stakworkService.createProject({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      budget: {
        min: parseInt(formData.get('budgetMin') as string),
        max: parseInt(formData.get('budgetMax') as string),
        currency: 'USD'
      },
      skills: (formData.get('skills') as string).split(',').map(s => s.trim())
    });
    
    return project;
  };

  return (
    <form action={handleCreate}>
      {/* form fields */}
    </form>
  );
}
```

### 3. In Client Components

```typescript
'use client';

import { useState } from 'react';

export function CreateProjectForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stakwork/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Project',
          description: 'Description',
          budget: { min: 1000, max: 5000, currency: 'USD' },
          skills: ['TypeScript']
        })
      });

      if (response.ok) {
        const { project } = await response.json();
        console.log('Project created:', project);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

## Error Handling

The architecture provides comprehensive error handling:

```typescript
try {
  const project = await stakworkService.createProject(projectData);
} catch (error) {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.status) {
      case 401:
        console.error('Unauthorized - check API key');
        break;
      case 400:
        console.error('Bad request - check data format');
        break;
      case 408:
        console.error('Request timeout');
        break;
      default:
        console.error(`${apiError.service} error:`, apiError.message);
    }
  }
}
```

## Benefits of This Architecture

✅ **Minimal & Focused** - Only essential operations  
✅ **No external dependencies** - Uses native fetch  
✅ **Environment validation** - Fail-fast configuration  
✅ **Singleton services** - Efficient resource usage  
✅ **Comprehensive error handling** - Detailed error context  
✅ **Type safety** - Full TypeScript support  
✅ **Service identification** - Easy debugging  
✅ **Next.js optimized** - Works seamlessly with App Router  

## Adding More Operations

To add more operations to existing services:

1. **Add method to service class:**
```typescript
// In src/services/stakwork.ts
async getProjects(): Promise<any> {
  return this.client.get('/projects', undefined, 'stakwork');
}
```

2. **Create API route:**
```typescript
// src/app/api/stakwork/projects/route.ts
export async function GET() {
  const projects = await stakworkService.getProjects();
  return NextResponse.json({ projects });
}
```

This architecture provides a solid foundation that can be easily extended as your needs grow. 