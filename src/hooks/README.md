# Workspace Hooks

This directory contains focused hooks for workspace management and access control.

## Overview

The workspace functionality has been split into separate, focused hooks for better maintainability and reusability:

- **`useWorkspace`** - Core workspace operations and data
- **`useWorkspaceAccess`** - Permission checking and access control

## Hooks

### `useWorkspace.ts`

**Purpose**: Core workspace operations, data management, and state handling.

**Returns**:
```typescript
{
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
  hasAccess: boolean;
  
  // Operations
  switchWorkspace: (workspace: WorkspaceWithRole) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspace: () => Promise<void>;
  
  // Helper methods
  isOwner: boolean;
  isAdmin: boolean;
  isPM: boolean;
  isDeveloper: boolean;
  isStakeholder: boolean;
  isViewer: boolean;
  
  // Workspace utilities
  getWorkspaceById: (workspaceId: string) => WorkspaceWithRole | undefined;
  getWorkspaceBySlug: (workspaceSlug: string) => WorkspaceWithRole | undefined;
  isCurrentWorkspace: (workspaceId: string) => boolean;
}
```

**Usage**:
```typescript
import { useWorkspace } from '@/hooks/useWorkspace';

function MyComponent() {
  const { 
    workspace, 
    slug, 
    role, 
    switchWorkspace, 
    isOwner 
  } = useWorkspace();
  
  // Use workspace data...
}
```

### `useWorkspaceAccess.ts`

**Purpose**: Permission checking and access control for the current workspace.

**Returns**:
```typescript
{
  // Basic permission flags
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
  isOwner: boolean;
  hasAccess: boolean;
  role: WorkspaceRole | null;
  
  // Granular permissions object
  permissions: {
    canManageWorkspace: boolean;
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canChangeRoles: boolean;
    canViewContent: boolean;
    canCreateContent: boolean;
    canEditContent: boolean;
    canDeleteContent: boolean;
    canManageProducts: boolean;
    canManageFeatures: boolean;
    canManageRoadmaps: boolean;
    canManageRepositories: boolean;
    canManageSwarms: boolean;
    canViewTasks: boolean;
    canAssignTasks: boolean;
    canManageTasks: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
    canViewSettings: boolean;
    canManageSettings: boolean;
  };
  
  // Permission checking utilities
  checkPermission: (requiredRole: WorkspaceRole) => boolean;
  requiresRole: (requiredRole: WorkspaceRole) => boolean;
  hasAnyRole: (roles: WorkspaceRole[]) => boolean;
  hasMinimumRole: (minimumRole: WorkspaceRole) => boolean;
  
  // Helper methods
  canManage: (resource: 'workspace' | 'members' | 'content' | 'settings') => boolean;
  getAccessLevel: () => 'none' | 'read' | 'write' | 'admin' | 'owner';
  getPermissionSummary: () => PermissionSummary;
}
```

**Usage**:
```typescript
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

function MyComponent() {
  const { 
    canWrite, 
    permissions, 
    checkPermission,
    getAccessLevel 
  } = useWorkspaceAccess();
  
  // Use permission checks...
  if (canWrite) {
    // Show edit buttons
  }
  
  if (permissions.canManageRepositories) {
    // Show repository management
  }
  
  if (checkPermission('ADMIN')) {
    // Admin-only features
  }
}
```

## Role Hierarchy

The permission system follows a hierarchical role structure:

```
OWNER (6)     - Full control over workspace
  ↑
ADMIN (5)     - Manage users, settings, repositories
  ↑  
PM (4)        - Product management, features, roadmaps
  ↑
DEVELOPER (3) - Development tasks, content creation
  ↑
STAKEHOLDER (2) - Limited content interaction
  ↑
VIEWER (1)    - Read-only access
```

Higher roles inherit all permissions from lower roles.

## Permission Categories

### Workspace Management
- **Owner**: Full workspace control, delete workspace, change ownership
- **Admin**: Invite/remove members, manage settings, repositories

### Content & Development
- **Write roles** (Developer+): Create, edit, delete content, manage tasks
- **Read roles** (All): View content, tasks, analytics

### Product Management
- **PM+**: Manage products, features, roadmaps
- **Developer+**: Implement features, manage development tasks

## Examples

### Conditional Rendering Based on Permissions

```typescript
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

function RepositorySettings() {
  const { permissions } = useWorkspaceAccess();
  
  return (
    <div>
      {permissions.canViewSettings && (
        <SettingsView />
      )}
      
      {permissions.canManageRepositories && (
        <RepositoryManagement />
      )}
      
      {permissions.canManageWorkspace && (
        <WorkspaceSettings />
      )}
    </div>
  );
}
```

### Role-based Navigation

```typescript
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

function Navigation() {
  const { slug } = useWorkspace();
  const { canWrite, canAdmin, permissions } = useWorkspaceAccess();
  
  return (
    <nav>
      <Link href={`/w/${slug}`}>Dashboard</Link>
      
      {canWrite && (
        <Link href={`/w/${slug}/tasks`}>Tasks</Link>
      )}
      
      {permissions.canManageProducts && (
        <Link href={`/w/${slug}/roadmap`}>Roadmap</Link>
      )}
      
      {canAdmin && (
        <Link href={`/w/${slug}/settings`}>Settings</Link>
      )}
    </nav>
  );
}
```

### Permission Guards

```typescript
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

function ProtectedAction() {
  const { checkPermission, getAccessLevel } = useWorkspaceAccess();
  
  const handleDeleteAction = () => {
    if (!checkPermission('ADMIN')) {
      alert('You need admin permissions to delete this item');
      return;
    }
    
    // Proceed with deletion
  };
  
  const accessLevel = getAccessLevel();
  if (accessLevel === 'none') {
    return <div>No access to this workspace</div>;
  }
  
  return (
    <button 
      onClick={handleDeleteAction}
      disabled={!checkPermission('ADMIN')}
    >
      Delete Item
    </button>
  );
}
```

## Migration from Old Pattern

If you were previously using the WorkspaceContext directly:

**Before**:
```typescript
import { useWorkspace } from '@/contexts/WorkspaceContext';

const { canRead, canWrite, canAdmin } = useWorkspace();
```

**After**:
```typescript
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';

const { workspace, role, switchWorkspace } = useWorkspace();
const { canRead, canWrite, canAdmin } = useWorkspaceAccess();
```

## Best Practices

1. **Use specific hooks**: Import only what you need from each hook
2. **Granular permissions**: Use the `permissions` object for feature-specific checks
3. **Role hierarchy**: Use `checkPermission()` for role-based access
4. **Error handling**: Always check `hasAccess` before showing workspace content
5. **Loading states**: Handle loading states from `useWorkspace()` appropriately

## Integration with Components

The hooks work seamlessly with the existing workspace infrastructure:

- **WorkspaceProvider**: Must wrap your app to provide context
- **API routes**: Hooks automatically call `/api/workspaces/*` endpoints
- **Authentication**: Integrates with NextAuth.js sessions
- **URL routing**: Automatically detects workspace from `/w/[slug]/*` paths 