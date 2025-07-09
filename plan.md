# Workspace-Scoped Routing Refactoring Plan

## Overview
Refactor the application from `/dashboard/*` routes to `/{workspace-id}/*` routes, implementing proper workspace-scoped access control and maintaining all existing functionality.

## Current State Analysis
- **Current Routes:** `/dashboard/*` (dashboard, roadmap, tasks, settings, code-graph, stakgraph)
- **Auth Flow:** Login → `/dashboard` (hardcoded)
- **Database:** Full workspace support with User-Workspace relationships
- **Missing:** Workspace-scoped routing, workspace selection logic, proper middleware

## Phase 1: Core Infrastructure Setup

### Step 1: Update Workspace Service Layer
**Files:** `src/services/workspace.ts`
- [ ] Add `getWorkspaceBySlug(slug: string, userId: string)` function
- [ ] Add `getDefaultWorkspaceForUser(userId: string)` function
- [ ] Add `getUserWorkspaces(userId: string)` function with role checking
- [ ] Add workspace access validation functions
- [ ] Update error handling for workspace not found scenarios

### Step 2: Create Workspace Context & Hooks
**Files:** 
- [ ] `src/contexts/WorkspaceContext.tsx` - React context for current workspace
- [ ] `src/hooks/useWorkspace.ts` - Hook for workspace operations
- [ ] `src/hooks/useWorkspaceAccess.ts` - Hook for access control validation

### Step 3: Update Middleware for Workspace Routing
**Files:** `middleware.ts`
- [ ] Add workspace slug validation and extraction
- [ ] Implement workspace access control checks
- [ ] Handle workspace not found → redirect to workspace selector
- [ ] Handle user with no workspaces → redirect to onboarding
- [ ] Update route matching patterns to include `/{workspace-slug}/*`

## Phase 2: Authentication & Navigation Flow

### Step 4: Update Authentication Flow
**Files:** 
- [ ] `src/app/auth/signin/page.tsx` - Change redirect from `/dashboard` to workspace logic
- [ ] `src/lib/auth/nextauth.ts` - Update callbacks to handle workspace routing
- [ ] Add post-login workspace resolution logic

### Step 5: Create Workspace Selection & Landing Pages
**Files:**
- [ ] `src/app/page.tsx` - Landing page with workspace selector (for users with multiple workspaces)
- [ ] `src/app/workspaces/page.tsx` - List all user workspaces
- [ ] `src/app/workspaces/new/page.tsx` - Create new workspace (alternative to onboarding)
- [ ] `src/components/WorkspaceSelector.tsx` - Dropdown/modal for workspace switching

## Phase 3: Route Structure Migration

### Step 6: Create New Workspace-Scoped Route Structure
**New Directory Structure:**
```
src/app/
├── [workspace]/
│   ├── layout.tsx                    # Workspace-scoped layout with access control
│   ├── dashboard/
│   │   └── page.tsx                  # Migrated from /dashboard/page.tsx
│   ├── roadmap/
│   │   ├── page.tsx                  # Migrated from /dashboard/roadmap/page.tsx
│   │   └── feature/
│   │       └── [id]/
│   │           └── page.tsx          # Migrated from /dashboard/roadmap/feature/[id]/page.tsx
│   ├── tasks/
│   │   └── page.tsx                  # Migrated from /dashboard/tasks/page.tsx
│   ├── settings/
│   │   └── page.tsx                  # Migrated from /dashboard/settings/page.tsx
│   ├── code-graph/
│   │   └── page.tsx                  # Migrated from /dashboard/code-graph/page.tsx
│   └── stakgraph/
│       └── page.tsx                  # Migrated from /dashboard/stakgraph/page.tsx
```

### Step 7: Create Workspace Layout with Access Control
**Files:** `src/app/[workspace]/layout.tsx`
- [ ] Extract workspace slug from params
- [ ] Validate user access to workspace
- [ ] Load workspace data and provide via context
- [ ] Handle workspace not found or access denied
- [ ] Integrate existing DashboardLayout component

### Step 8: Migrate Dashboard Pages (Sequential)

#### 8a. Migrate Dashboard Home
**Files:**
- [ ] `src/app/[workspace]/dashboard/page.tsx` - Copy from `src/app/dashboard/page.tsx`
- [ ] Update any hardcoded navigation links to include workspace slug
- [ ] Test workspace context access

#### 8b. Migrate Roadmap Pages
**Files:**
- [ ] `src/app/[workspace]/roadmap/page.tsx` - Copy from `src/app/dashboard/roadmap/page.tsx`
- [ ] `src/app/[workspace]/roadmap/feature/[id]/page.tsx` - Copy from `src/app/dashboard/roadmap/feature/[id]/page.tsx`
- [ ] Update all roadmap components to use workspace context
- [ ] Update API calls to include workspace scope

#### 8c. Migrate Tasks Page
**Files:**
- [ ] `src/app/[workspace]/tasks/page.tsx` - Copy from `src/app/dashboard/tasks/page.tsx`
- [ ] Update task filtering/loading to be workspace-scoped
- [ ] Update all task-related API calls

#### 8d. Migrate Settings Page
**Files:**
- [ ] `src/app/[workspace]/settings/page.tsx` - Copy from `src/app/dashboard/settings/page.tsx`
- [ ] Add workspace-specific settings
- [ ] Update settings context and functionality

#### 8e. Migrate Code Graph Page
**Files:**
- [ ] `src/app/[workspace]/code-graph/page.tsx` - Copy from `src/app/dashboard/code-graph/page.tsx`
- [ ] Update to use workspace-scoped repositories
- [ ] Update CodeGraphWizard component

#### 8f. Migrate Stakgraph Page
**Files:**
- [ ] `src/app/[workspace]/stakgraph/page.tsx` - Copy from `src/app/dashboard/stakgraph/page.tsx`
- [ ] Update to use workspace-scoped swarm data

## Phase 4: Component & API Updates

### Step 9: Update Navigation Components
**Files:**
- [ ] `src/components/DashboardLayout.tsx` - Add workspace context integration
- [ ] `src/components/Sidebar.tsx` - Update navigation links to include workspace slug
- [ ] `src/components/NavUser.tsx` - Add workspace switching functionality
- [ ] `src/components/WorkspaceSwitcher.tsx` - Update for new routing

### Step 10: Update API Routes for Workspace Scoping
**Files:** (Update all API routes to require workspace context)
- [ ] `src/app/api/workspaces/route.ts` - Update for new workspace operations
- [ ] `src/app/api/github/repositories/route.ts` - Add workspace scoping
- [ ] `src/app/api/stakwork/create-project/route.ts` - Add workspace scoping
- [ ] `src/app/api/pool-manager/create-pool/route.ts` - Add workspace scoping
- [ ] Add workspace validation middleware for API routes

### Step 11: Update All Components with Workspace Context
**Files:** (Update components to use workspace context)
- [ ] `src/components/roadmap/*` - All roadmap components
- [ ] `src/components/wizard/*` - All wizard components  
- [ ] `src/components/CreateWorkspaceDialog.tsx`
- [ ] Any other components making API calls or navigation

## Phase 5: Data Layer Updates

### Step 12: Update Hooks and Services
**Files:**
- [ ] `src/hooks/use-stakwork.ts` - Add workspace scoping
- [ ] `src/hooks/use-pool-manager.ts` - Add workspace scoping
- [ ] `src/hooks/useRepositories.ts` - Add workspace scoping
- [ ] `src/services/*` - Update all services for workspace scoping

### Step 13: Update Type Definitions
**Files:**
- [ ] `src/types/workspace.ts` - Add workspace context types
- [ ] `src/types/common.ts` - Add workspace-scoped type unions
- [ ] Update all other type files to include workspace context

## Phase 6: Testing & Validation

### Step 14: Update Middleware & Route Protection
**Files:** `middleware.ts`
- [ ] Finalize workspace access control logic
- [ ] Add comprehensive logging for debugging
- [ ] Test all edge cases (no workspace, invalid workspace, access denied)

### Step 15: Test Workspace Flow End-to-End
- [ ] Test new user signup → onboarding → workspace creation → redirect to workspace dashboard
- [ ] Test existing user login → workspace resolution → redirect to default workspace
- [ ] Test user with multiple workspaces → workspace selection
- [ ] Test workspace switching functionality
- [ ] Test all migrated pages work correctly with workspace context

### Step 16: Update Navigation & Links
- [ ] Search codebase for any hardcoded `/dashboard` links
- [ ] Update all navigation to use workspace-aware routing
- [ ] Update any external links or redirects

## Phase 7: Cleanup & Optimization

### Step 17: Remove Old Dashboard Routes
**Files:** (After confirming new routes work)
- [ ] Delete `src/app/dashboard/` directory entirely
- [ ] Update any imports that referenced old dashboard files

### Step 18: Update Documentation & Configuration
**Files:**
- [ ] Update `base_url_structure.md` to reflect new implementation
- [ ] Update any configuration files with new route patterns
- [ ] Update middleware config patterns

### Step 19: Performance & SEO Optimization
- [ ] Add workspace-aware metadata generation
- [ ] Implement workspace-scoped caching where appropriate
- [ ] Add workspace context to error boundaries

## Phase 8: Advanced Features (Post-Migration)

### Step 20: Enhanced Workspace Features
- [ ] Implement workspace invitation system
- [ ] Add workspace member management UI
- [ ] Add workspace-level settings and customization
- [ ] Implement workspace-scoped search and filtering

## Implementation Notes

### Critical Considerations:
1. **Data Migration:** No database changes required - schema already supports workspace scoping
2. **Backward Compatibility:** Implement redirects from old `/dashboard/*` routes to prevent 404s
3. **Error Handling:** Graceful handling of workspace not found, access denied scenarios
4. **Performance:** Minimize workspace lookups by caching workspace data in layout
5. **Security:** Ensure all API routes validate workspace access

### Testing Strategy:
- Test each phase incrementally
- Keep old routes working until new routes are fully tested
- Use feature flags to gradually roll out new routing
- Test with multiple workspace scenarios

### Rollback Plan:
- Keep old dashboard routes until new routes are confirmed working
- Use route prioritization to prefer old routes during testing
- Have database backup strategy for any data changes

## Estimated Timeline:
- **Phase 1-2:** 2-3 days (Infrastructure & Auth)
- **Phase 3:** 2-3 days (Route Structure)
- **Phase 4:** 3-4 days (Components & APIs)
- **Phase 5:** 1-2 days (Data Layer)
- **Phase 6:** 2-3 days (Testing)
- **Phase 7-8:** 1-2 days (Cleanup & Enhancement)

**Total:** ~12-17 days for complete migration 