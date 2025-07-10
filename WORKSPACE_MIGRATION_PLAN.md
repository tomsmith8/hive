# 🚀 Workspace Routing Migration Implementation Plan

## ✅ Completed Steps

### 1. **Routing Foundation ✅**
- [x] Updated all route components from `/dashboard/*` to `/w/{workspace-slug}/*`
- [x] Updated Sidebar.tsx for context-based navigation
- [x] Updated RoadmapContent.tsx with workspace context
- [x] Updated authentication flows
- [x] Updated middleware for legacy route handling

### 2. **Core Components ✅**
- [x] Updated DashboardLayout with workspace context integration
- [x] Enhanced NavUser with workspace switching functionality  
- [x] Created WorkspaceLink component for automatic URL correction
- [x] Added workspace indicator to navigation

### 3. **API Foundation ✅**
- [x] Added `export const dynamic = 'force-dynamic'` to workspace routes
- [x] Created workspace validation API endpoint

## 🔧 Critical Next Steps

### **IMMEDIATE PRIORITY: Component Updates (Step 1)**

#### **A. Update Sidebar.tsx - URGENT**
```bash
# Current issue: Sidebar still uses hardcoded paths
# Fix: Replace Link with WorkspaceLink
```

**File: `src/components/Sidebar.tsx`**
```diff
- import Link from "next/link";
+ import { WorkspaceLink } from "./WorkspaceLink";

// Replace all Link components with WorkspaceLink
- <Link href="/roadmap">
+ <WorkspaceLink href="/roadmap">
```

#### **B. Update All Components Using Links**
**Search for components using hardcoded links:**
```bash
rg 'href="/(?!w/|http|mailto|tel)' --type tsx
```

**Files to update:**
- All roadmap components
- Feature components  
- Task components
- Any component with navigation

### **IMMEDIATE PRIORITY: API Route Updates (Step 2)**

#### **A. Add Dynamic Directive to All Auth-Dependent Routes**
```typescript
// Add to ALL routes that use getServerSession:
export const dynamic = 'force-dynamic';
```

**Files to update:**
- `src/app/api/features/route.ts`
- `src/app/api/roadmap/route.ts` 
- Any API route using session data

#### **B. Update All API Routes for Workspace Scoping**
**Pattern to implement:**
```typescript
// Before: Direct DB access
const features = await db.feature.findMany();

// After: Workspace-scoped access
const features = await db.feature.findMany({
  where: { 
    workspace: { 
      slug: workspaceSlug,
      members: { some: { userId: session.user.id } }
    }
  }
});
```

### **IMMEDIATE PRIORITY: Hook Updates (Step 3)**

#### **A. Update All Data Hooks**
**Files requiring workspace scoping:**
- `src/hooks/useFeatures.ts`
- `src/hooks/useRoadmap.ts` 
- `src/hooks/useTasks.ts`
- Any hook making API calls

**Pattern:**
```typescript
// Before
const { data } = useSWR('/api/features');

// After  
const { workspace } = useWorkspace();
const { data } = useSWR(
  workspace?.slug ? `/api/workspaces/${workspace.slug}/features` : null
);
```

#### **B. Implement Parallel Data Fetching**
```typescript
import { cache } from 'react';

export const getWorkspaceData = cache(async (slug: string) => {
  // Cached workspace data fetching
});
```

### **HIGH PRIORITY: Service Layer Updates (Step 4)**

#### **A. Update All Services for Workspace Context**
**Files to update:**
- `src/services/feature.ts`
- `src/services/roadmap.ts`
- `src/services/workspace.ts`

**Pattern:**
```typescript
// Before
export async function getFeatures() {
  return db.feature.findMany();
}

// After
export async function getFeaturesByWorkspace(workspaceSlug: string, userId: string) {
  // Validate access first
  const hasAccess = await validateWorkspaceAccess(workspaceSlug, userId);
  if (!hasAccess) throw new Error('Access denied');
  
  return db.feature.findMany({
    where: { workspace: { slug: workspaceSlug } }
  });
}
```

### **HIGH PRIORITY: Type Updates (Step 5)**

#### **A. Update Type Definitions**
**File: `src/types/workspace.ts`**
```typescript
// Add comprehensive workspace context types
export interface WorkspaceContextData {
  workspace: WorkspaceWithRole | null;
  workspaces: WorkspaceWithRole[];
  loading: boolean;
  error: string | null;
  hasAccess: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canWrite: boolean;
  switchWorkspace: (workspace: WorkspaceWithRole) => Promise<void>;
}
```

#### **B. Update All API Response Types**
```typescript
// All API responses should include workspace context
export interface WorkspaceScopedResponse<T> {
  data: T;
  workspace: {
    slug: string;
    name: string;
    userRole: WorkspaceRole;
  };
}
```

### **MEDIUM PRIORITY: Advanced Features (Step 6)**

#### **A. Implement Workspace-Scoped Cache Invalidation**
```typescript
import { revalidateTag } from 'next/cache';

// Tag all cache operations with workspace
export function revalidateWorkspace(slug: string) {
  revalidateTag(`workspace:${slug}`);
  revalidateTag(`workspace:${slug}:features`);
  revalidateTag(`workspace:${slug}:roadmap`);
}
```

#### **B. Remove DB Calls from Middleware**
```typescript
// Ensure middleware stays edge-safe
// Move any DB operations to API routes
```

#### **C. Add Prefetching to Navigation**
```typescript
// In WorkspaceLink component
export function WorkspaceLink({ href, children, prefetch = true, ...props }) {
  // Implement intelligent prefetching based on workspace context
}
```

## 🧪 Testing Strategy

### **1. Manual Testing Checklist**
- [ ] Workspace switching works seamlessly
- [ ] All links auto-correct to workspace context
- [ ] Legacy dashboard URLs redirect properly
- [ ] API endpoints validate workspace access
- [ ] User can only see their workspace data

### **2. Automated Testing**
```typescript
// Add workspace context tests
describe('Workspace Context', () => {
  it('should switch workspaces correctly', () => {
    // Test workspace switching
  });
  
  it('should validate workspace access', () => {
    // Test access validation
  });
});
```

## 🚨 Migration Risks & Mitigation

### **Risk 1: Broken Navigation**
- **Mitigation**: WorkspaceLink component handles URL correction
- **Fallback**: Middleware redirects legacy URLs

### **Risk 2: API Access Violations**
- **Mitigation**: All API routes validate workspace access
- **Fallback**: Comprehensive error handling

### **Risk 3: Performance Impact**
- **Mitigation**: Implement caching with revalidateTag
- **Fallback**: Parallel data fetching with cache()

## 📋 Implementation Order

1. **CRITICAL** - Update remaining components with WorkspaceLink
2. **CRITICAL** - Add dynamic directive to all auth-dependent API routes  
3. **CRITICAL** - Update all hooks for workspace scoping
4. **HIGH** - Update service layer for workspace validation
5. **HIGH** - Update type definitions
6. **MEDIUM** - Implement caching strategy
7. **LOW** - Add comprehensive testing

## 🎯 Success Criteria

- ✅ All URLs are workspace-scoped
- ✅ Users can switch workspaces seamlessly  
- ✅ All data is properly workspace-scoped
- ✅ Legacy URLs redirect correctly
- ✅ API endpoints validate access
- ✅ Performance is maintained or improved

---

**Next Action**: Start with updating remaining components to use WorkspaceLink, then move through the priority list systematically. 