# Context Documentation

This directory contains React contexts for global state management across the application.

> **📌 Important**: Workspace functionality has been split into focused hooks. See `/src/hooks/README.md` for the `useWorkspace` and `useWorkspaceAccess` hooks documentation.

## WorkspaceContext

The `WorkspaceContext` provides workspace data, user role, and workspace switching functionality to all child components.

### Context Shape

```typescript
interface WorkspaceContextType {
  // Current workspace data
  workspace: WorkspaceWithAccess | null;
  slug: string;
  id: string;
  role: WorkspaceRole | null;
  
  // Available workspaces
  workspaces: WorkspaceWithRole[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Actions
  switchWorkspace: (workspace: WorkspaceWithRole) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspace: () => Promise<void>;
  
  // Helper methods
  hasAccess: boolean;
  // Note: Permission methods moved to useWorkspaceAccess hook
}
```

### Setup

Wrap your application or relevant parts with the `WorkspaceProvider`:

```tsx
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider initialSlug="my-workspace">
      {children}
    </WorkspaceProvider>
  );
}
```

### Usage

Use the focused hooks to access workspace data and permissions:

```tsx
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

export function MyComponent() {
  const {
    workspace,
    slug,
    id,
    role,
    workspaces,
    loading,
    error,
    switchWorkspace,
    hasAccess,
  } = useWorkspace();
  
  const {
    canWrite,
    canRead,
    canAdmin,
    permissions,
  } = useWorkspaceAccess();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hasAccess) return <div>No access</div>;

  return (
    <div>
      <h1>{workspace?.name}</h1>
      <p>Slug: {slug}</p>
      <p>Your role: {role}</p>
      
      {canWrite && (
        <button>Edit (you have write access)</button>
      )}
      
      <select onChange={(e) => {
        const ws = workspaces.find(w => w.id === e.target.value);
        if (ws) switchWorkspace(ws);
      }}>
        {workspaces.map(ws => (
          <option key={ws.id} value={ws.id}>
            {ws.name} ({ws.userRole})
          </option>
        ))}
      </select>
    </div>
  );
}
```

### URL Structure

The context automatically handles workspace routing:
- `/w/[slug]/dashboard` - Workspace-specific pages
- `/dashboard` - No workspace context (will redirect to default workspace)

### Permission System

Permission checking has been moved to the `useWorkspaceAccess` hook:
- `canRead`: VIEWER, STAKEHOLDER, DEVELOPER, PM, ADMIN, OWNER
- `canWrite`: DEVELOPER, PM, ADMIN, OWNER  
- `canAdmin`: ADMIN, OWNER

For detailed permission documentation, see `/src/hooks/README.md`.

### API Requirements

The context expects these API endpoints:
- `GET /api/workspaces` - List user's workspaces
- `GET /api/workspaces/[slug]` - Get specific workspace with access info

### Features

- **Automatic URL Detection**: Extracts workspace slug from current pathname
- **Workspace Switching**: Updates URL when switching workspaces
- **Permission Checking**: Built-in role-based access control
- **Loading States**: Proper loading and error handling
- **Session Integration**: Works with NextAuth.js sessions
- **TypeScript Support**: Fully typed for IntelliSense support

### Example Usage in Layout

```tsx
// app/layout.tsx
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import SessionProvider from '@/providers/SessionProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SessionProvider>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Workspace-Aware Components

Use the context to create workspace-aware components:

```tsx
// components/WorkspaceBreadcrumb.tsx
import { useWorkspace } from '@/hooks/useWorkspace';

export function WorkspaceBreadcrumb() {
  const { workspace, slug } = useWorkspace();
  
  return (
    <nav>
      <a href="/">Home</a> / 
      <a href={`/w/${slug}`}>{workspace?.name}</a>
    </nav>
  );
}
``` 