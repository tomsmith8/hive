# Workspace-Scoped Routing Refactoring Plan - Combined Approach

## Overview
Refactor the application from `/dashboard/*` routes to `/{workspace-slug}/*` routes using an incremental migration strategy that implements proper workspace-scoped access control while maintaining all existing functionality. This approach combines the safety of gradual migration with the benefits of complete infrastructure setup from the start.

## Current State Analysis
- **Current Routes:** `/dashboard/*` (dashboard, roadmap, tasks, settings, code-graph, stakgraph)
- **Auth Flow:** Login → `/dashboard` (hardcoded)
- **Database:** Full workspace support with User-Workspace relationships
- **Missing:** Workspace-scoped routing, workspace selection logic, proper middleware

## Strategy: Incremental Migration with Full Infrastructure
1. **Build all workspace infrastructure first** (context, hooks, middleware, auth flow)
2. **Rename `/dashboard` to `/workspace`** and integrate new infrastructure
3. **Gradually migrate pages to `/[workspace-slug]`** routes one by one
4. **Remove temporary routes** and add redirects once migration is complete

---

## Phase 1: Core Infrastructure Setup (Days 1-2)

### Step 1: Update Workspace Service Layer
**Files:** `src/services/workspace.ts`
- [ ] **Add `getWorkspaceBySlug(slug: string, userId: string)` function** - Retrieves a specific workspace by its slug and validates user access in a single operation
- [ ] **Add `getDefaultWorkspaceForUser(userId: string)` function** - Gets the user's primary/default workspace for automatic redirection after login
- [ ] **Add `getUserWorkspaces(userId: string)` function with role checking** - Returns all workspaces the user has access to, including their role in each workspace
- [ ] **Add workspace access validation functions** - Utility functions to check if a user can read/write/admin a specific workspace
- [ ] **Update error handling for workspace not found scenarios** - Standardize error responses for invalid workspace slugs or access denied cases

### Step 2: Create Workspace Context & Hooks
**Files:** 
- [ ] **`src/contexts/WorkspaceContext.tsx` - React context for current workspace** - Provides workspace data, user role, and workspace switching functionality to all child components
- [ ] **`src/hooks/useWorkspace.ts` - Hook for workspace operations** - Encapsulates workspace CRUD operations, switching between workspaces, and loading states
- [ ] **`src/hooks/useWorkspaceAccess.ts` - Hook for access control validation** - Provides easy access to permission checking functions (canRead, canWrite, canAdmin) for the current workspace

### Step 3: Update Middleware for Workspace Routing
**Files:** `middleware.ts`
- [ ] **Add workspace slug validation and extraction** - Parse URLs to extract workspace slugs and validate they match the expected format (alphanumeric, hyphens, underscores)
- [ ] **Implement workspace access control checks** - Verify user has permission to access the requested workspace before allowing route access
- [ ] **Handle workspace not found → redirect to workspace selector** - Gracefully handle invalid workspace slugs by redirecting to a workspace selection page
- [ ] **Handle user with no workspaces → redirect to onboarding** - Detect users without any workspace access and send them through the workspace creation flow
- [ ] **Update route matching patterns to include both `/workspace/*` and `/[workspace-slug]/*`** - Support both old temporary routes and new workspace-scoped routes during migration

## Phase 2: Authentication & User Flow Setup (Day 2)

### Step 4: Update Authentication Flow
**Files:** 
- [ ] **`src/app/auth/signin/page.tsx` - Change redirect from `/dashboard` to workspace logic** - Replace hardcoded dashboard redirect with intelligent workspace resolution based on user's workspace access
- [ ] **`src/lib/auth/nextauth.ts` - Update callbacks to handle workspace routing** - Modify NextAuth callbacks to check user workspace status and redirect appropriately after successful authentication
- [ ] **Add post-login workspace resolution logic** - Implement logic to determine where to send users: onboarding (no workspaces), direct to workspace (one workspace), or workspace selector (multiple workspaces)

### Step 5: Create Workspace Selection & Landing Pages
**Files:**
- [ ] **`src/app/page.tsx` - Landing page with workspace selector** - Root page that shows workspace selection for users with multiple workspaces or redirects appropriately for users with single/no workspaces
- [ ] **`src/app/workspaces/page.tsx` - List all user workspaces** - Administrative page showing all workspaces the user has access to with options to switch, create new, or manage existing workspaces
- [ ] **`src/app/workspaces/new/page.tsx` - Create new workspace** - Alternative workspace creation flow for users who already have workspaces but want to create additional ones
- [ ] **`src/components/WorkspaceSelector.tsx` - Dropdown/modal for workspace switching** - Reusable component for quick workspace switching from navigation or other UI elements

---

## Phase 3: Incremental Route Migration (Days 3-6)

### Step 6: Rename Dashboard to Workspace (Day 3)
**Goal:** Simple path rename while integrating new infrastructure
- [ ] **Rename `src/app/dashboard/` directory to `src/app/workspace/`** - Direct folder rename to change base path from /dashboard to /workspace without logic changes
- [ ] **Update all imports referencing dashboard paths** - Search and replace all import statements that reference the old dashboard directory structure
- [ ] **Update hardcoded `/dashboard` links in navigation components** - Find and update all navigation links, redirects, and route references to use /workspace instead
- [ ] **Integrate WorkspaceContext into workspace layout** - Update the workspace layout to provide workspace context to all child pages using the new infrastructure
- [ ] **Update workspace pages to use new hooks** - Modify existing workspace pages to consume workspace data through the new useWorkspace and useWorkspaceAccess hooks
- [ ] **Test all /workspace routes work with new context** - Verify that all pages under /workspace function correctly with the new workspace context and access control

### Step 7: Create Workspace-Scoped Route Structure (Day 4)
**Goal:** Establish new `/[workspace-slug]/*` routes alongside existing `/workspace/*` routes
**New Directory Structure:**
```
src/app/
├── workspace/                    # Temporary fallback routes (will be removed later)
│   ├── layout.tsx               # Uses WorkspaceContext for consistency
│   ├── page.tsx                 # Dashboard home
│   ├── roadmap/page.tsx         # Roadmap features
│   └── ...                      # Other existing pages
├── [workspace]/                 # New workspace-scoped routes
│   ├── layout.tsx               # Workspace access control + context loading
│   └── ...                      # Pages migrated one by one
```

- [ ] **Create `src/app/[workspace]/layout.tsx` with full access control** - New layout that extracts workspace slug, validates access, loads workspace data, and provides context to child routes
- [ ] **Configure route priority so `/[workspace]/*` takes precedence** - Ensure Next.js routing prioritizes specific workspace routes over the temporary /workspace fallback routes
- [ ] **Add comprehensive error handling for workspace not found/access denied** - Implement user-friendly error pages and automatic redirects for invalid workspace access attempts
- [ ] **Set up workspace context loading with proper loading states** - Implement loading indicators and error boundaries for workspace data fetching in the new layout

### Step 8: Migrate Pages One by One (Days 4-6)

#### 8a. Migrate Dashboard Home (Day 4)
- [ ] **Copy `src/app/workspace/page.tsx` to `src/app/[workspace]/page.tsx`** - Create workspace-scoped version of dashboard home page with identical functionality
- [ ] **Update navigation links to include workspace slug parameter** - Modify any internal navigation to use the workspace slug in URLs
- [ ] **Test workspace context access and data loading** - Verify the page correctly receives and uses workspace data from the new context
- [ ] **Verify workspace scoping works correctly** - Test that users only see data relevant to the current workspace and cannot access other workspace data

#### 8b. Migrate Roadmap Pages (Day 4-5)
- [ ] **Copy `src/app/workspace/roadmap/page.tsx` to `src/app/[workspace]/roadmap/page.tsx`** - Migrate main roadmap listing page with workspace-scoped data fetching
- [ ] **Copy `src/app/workspace/roadmap/feature/[id]/page.tsx` to `src/app/[workspace]/roadmap/feature/[id]/page.tsx`** - Migrate feature detail pages ensuring feature access is workspace-scoped
- [ ] **Update all roadmap components to use workspace context** - Modify roadmap components to filter and display only features belonging to the current workspace
- [ ] **Update API calls to include workspace scope in data fetching** - Ensure all roadmap-related API calls include workspace ID for proper data isolation
- [ ] **Test feature creation, editing, and viewing within workspace scope** - Verify all roadmap functionality works correctly within workspace boundaries

#### 8c. Migrate Tasks Page (Day 5)
- [ ] **Copy `src/app/workspace/tasks/page.tsx` to `src/app/[workspace]/tasks/page.tsx`** - Migrate task management page with workspace-specific task filtering
- [ ] **Update task filtering/loading to be workspace-scoped** - Ensure task lists only show tasks belonging to the current workspace
- [ ] **Update all task-related API calls to include workspace context** - Modify task CRUD operations to include workspace validation and scoping
- [ ] **Test task creation, editing, and status updates within workspace** - Verify task functionality is properly isolated to the current workspace

#### 8d. Migrate Settings Page (Day 5)
- [ ] **Copy `src/app/workspace/settings/page.tsx` to `src/app/[workspace]/settings/page.tsx`** - Migrate settings page with both user and workspace-specific settings
- [ ] **Add workspace-specific settings sections** - Implement settings that are specific to the current workspace (name, description, member management)
- [ ] **Update settings context to handle both user and workspace settings** - Extend settings functionality to manage workspace-level configurations
- [ ] **Test workspace settings changes and user settings isolation** - Verify workspace settings only affect the current workspace and don't interfere with user settings

#### 8e. Migrate Code Graph Page (Day 6)
- [ ] **Copy `src/app/workspace/code-graph/page.tsx` to `src/app/[workspace]/code-graph/page.tsx`** - Migrate code graph visualization with workspace-scoped repository access
- [ ] **Update to use workspace-scoped repositories** - Ensure code graph only shows repositories and code data belonging to the current workspace
- [ ] **Update CodeGraphWizard component to work with workspace context** - Modify wizard to create and configure code graphs within the workspace scope
- [ ] **Test code graph generation and visualization within workspace** - Verify code graph functionality is properly isolated and workspace-specific

#### 8f. Migrate Stakgraph Page (Day 6)
- [ ] **Copy `src/app/workspace/stakgraph/page.tsx` to `src/app/[workspace]/stakgraph/page.tsx`** - Migrate stakeholder graph with workspace-scoped swarm and stakeholder data
- [ ] **Update to use workspace-scoped swarm data** - Ensure stakeholder graphs only display data relevant to the current workspace
- [ ] **Test stakeholder graph functionality within workspace scope** - Verify stakeholder management is properly isolated to the workspace

---

## Phase 4: Component & API Updates (Days 7-8)

### Step 9: Update Navigation Components (Day 7)
- [ ] **Update `src/components/DashboardLayout.tsx` for workspace context integration** - Modify main layout component to seamlessly work with both old and new routing during migration
- [ ] **Update `src/components/Sidebar.tsx` navigation links to include workspace slug** - Ensure all sidebar navigation generates correct workspace-scoped URLs
- [ ] **Update `src/components/NavUser.tsx` to add workspace switching functionality** - Add workspace switching dropdown or menu to user navigation area
- [ ] **Update `src/components/WorkspaceSwitcher.tsx` for new routing structure** - Modify workspace switcher to generate correct URLs for the new routing system
- [ ] **Add workspace indicator to navigation** - Display current workspace name/slug in navigation so users know which workspace they're viewing

### Step 10: Update API Routes for Workspace Scoping (Day 7)
- [ ] **Update `src/app/api/workspaces/route.ts` for new workspace operations** - Add endpoints for workspace switching, validation, and user workspace listing
- [ ] **Update `src/app/api/github/repositories/route.ts` to add workspace scoping** - Ensure repository API endpoints filter results by workspace and validate workspace access
- [ ] **Update `src/app/api/stakwork/create-project/route.ts` to add workspace scoping** - Modify Stakwork integration to create projects within the correct workspace context
- [ ] **Update `src/app/api/pool-manager/create-pool/route.ts` to add workspace scoping** - Ensure pool manager operations are scoped to the current workspace
- [ ] **Add workspace validation middleware for API routes** - Create reusable middleware to validate workspace access for all workspace-scoped API endpoints

### Step 11: Update Components with Workspace Context (Day 8)
- [ ] **Update `src/components/roadmap/*` components to use workspace context** - Modify all roadmap-related components to consume and respect workspace scoping
- [ ] **Update `src/components/wizard/*` components to work with workspace scope** - Ensure setup wizards create resources within the correct workspace
- [ ] **Update `src/components/CreateWorkspaceDialog.tsx` for new workspace flow** - Modify workspace creation dialog to integrate with the new routing and context system
- [ ] **Update any other components making API calls to include workspace context** - Search for and update all components that make API calls to include proper workspace scoping

---

## Phase 5: Data Layer & Service Updates (Day 8)

### Step 12: Update Hooks and Services
- [ ] **Update `src/hooks/use-stakwork.ts` to add workspace scoping** - Ensure Stakwork hook operations are scoped to the current workspace
- [ ] **Update `src/hooks/use-pool-manager.ts` to add workspace scoping** - Modify pool manager hook to work within workspace boundaries
- [ ] **Update `src/hooks/useRepositories.ts` to add workspace scoping** - Ensure repository hook only fetches and manages repositories within the current workspace
- [ ] **Update `src/services/*` to include workspace context in all operations** - Modify all service layer functions to accept and use workspace context for data operations

### Step 13: Update Type Definitions
- [ ] **Update `src/types/workspace.ts` to add workspace context types** - Define TypeScript types for workspace context, user roles, and workspace-scoped operations
- [ ] **Update `src/types/common.ts` to add workspace-scoped type unions** - Add workspace-aware types that can be used across the application
- [ ] **Update all other type files to include workspace context where needed** - Review and update type definitions throughout the application to support workspace scoping

---

## Phase 6: Testing & Validation (Days 9-10)

### Step 14: Comprehensive Route Testing (Day 9)
- [ ] **Test new user signup → onboarding → workspace creation → redirect to workspace dashboard** - Verify complete new user onboarding flow works correctly with new routing
- [ ] **Test existing user login → workspace resolution → redirect to default workspace** - Ensure existing users are properly directed to their workspace after login
- [ ] **Test user with multiple workspaces → workspace selection flow** - Verify users with multiple workspaces can select and switch between them
- [ ] **Test workspace switching functionality across all pages** - Ensure workspace switching works correctly from any page in the application
- [ ] **Test all migrated pages work correctly with workspace context** - Verify each migrated page functions properly with workspace-scoped data and access control
- [ ] **Test edge cases: invalid workspace slugs, access denied, workspace not found** - Ensure proper error handling and user experience for all edge cases

### Step 15: Access Control Validation (Day 9)
- [ ] **Test workspace access control across different user roles** - Verify that admin, member, and read-only users have appropriate access levels
- [ ] **Test API endpoint security with workspace scoping** - Ensure API endpoints properly validate workspace access and return appropriate errors
- [ ] **Test data isolation between workspaces** - Verify that users cannot access or modify data from workspaces they don't have access to
- [ ] **Test middleware catches and handles unauthorized access attempts** - Ensure middleware properly redirects or blocks unauthorized workspace access

### Step 16: Performance & User Experience Testing (Day 10)
- [ ] **Test page load performance with workspace context loading** - Ensure workspace data loading doesn't significantly impact page performance
- [ ] **Test workspace switching performance** - Verify workspace switching is fast and doesn't cause unnecessary data reloading
- [ ] **Test error boundaries and loading states** - Ensure good user experience during workspace data loading and error conditions
- [ ] **Test navigation and URL handling** - Verify URLs are clean, shareable, and properly handle browser back/forward navigation

---

## Phase 7: Cleanup & Launch (Day 10)

### Step 17: Remove Temporary Routes
- [ ] **Remove `src/app/workspace/` directory entirely** - Delete all temporary /workspace routes once migration is confirmed working
- [ ] **Add redirects from `/workspace/*` to `/{default-workspace}/*`** - Implement automatic redirects for any remaining /workspace URLs to user's default workspace
- [ ] **Update any imports that referenced old workspace files** - Clean up any remaining import statements that reference the removed workspace directory
- [ ] **Remove any temporary migration code or feature flags** - Clean up any code that was only needed during the migration process

### Step 18: Final Documentation & Configuration Updates
- [ ] **Update `base_url_structure.md` to reflect new implementation** - Document the new routing structure and how workspace scoping works
- [ ] **Update middleware configuration patterns** - Document middleware patterns and configurations for future development
- [ ] **Update development setup documentation** - Ensure new developers understand the workspace scoping system and how to work with it
- [ ] **Add workspace management documentation** - Document how to create, manage, and switch between workspaces

### Step 19: Performance & SEO Optimization
- [ ] **Add workspace-aware metadata generation** - Implement dynamic metadata that reflects the current workspace context
- [ ] **Implement workspace-scoped caching where appropriate** - Add caching strategies that respect workspace boundaries
- [ ] **Add workspace context to error boundaries** - Ensure error handling includes workspace context for better debugging and user experience
- [ ] **Optimize workspace data loading and caching** - Implement efficient strategies for loading and caching workspace data

---

## Implementation Timeline

### **Total Estimated Time: 8-10 days**

- **Days 1-2:** Infrastructure setup (context, hooks, middleware, auth flow)
- **Day 3:** Rename routes + integrate new infrastructure into `/workspace`
- **Days 4-6:** Migrate pages to `/[workspace]` one by one
- **Days 7-8:** Update components, APIs, and data layer
- **Days 9-10:** Testing, cleanup, and documentation

---

## Critical Success Factors

### **Data Migration & Compatibility:**
- **No database changes required** - Schema already supports workspace scoping through existing relationships
- **Backward compatibility during migration** - Old `/workspace` routes work during transition period
- **Graceful error handling** - All edge cases (workspace not found, access denied) have proper user experience

### **Security & Access Control:**
- **Middleware enforces access control from day one** - No routes are accessible without proper workspace validation
- **API endpoints validate workspace access** - All data operations include workspace scoping and access validation
- **Data isolation between workspaces** - Users cannot access or modify data from workspaces they don't have access to

### **User Experience:**
- **Seamless onboarding flow** - New users without workspaces are guided through workspace creation
- **Intuitive workspace switching** - Users with multiple workspaces can easily switch between them
- **Clean, shareable URLs** - Workspace-scoped URLs are clean and can be shared with team members

### **Development & Maintenance:**
- **Incremental migration reduces risk** - Each page can be migrated and tested independently
- **Reusable infrastructure** - Context, hooks, and middleware can be used across all workspace-scoped features
- **Future-proof architecture** - Easy to add new workspace-scoped features and functionality

---

## Rollback Plan

### **If Issues Arise During Migration:**
- **Keep old `/workspace` routes until new routes are confirmed working** - Can quickly revert to old routing if issues are discovered
- **Use route prioritization to prefer old routes during testing** - Can temporarily disable new routes without code changes
- **Database backup strategy** - Although no schema changes are needed, maintain backups for safety
- **Feature flag system** - Can quickly disable new routing features if needed

### **Emergency Rollback Steps:**
1. Disable new `/[workspace]` routes by renaming the directory
2. Restore navigation to point to `/workspace` routes
3. Disable new middleware workspace validation
4. Revert authentication flow to redirect to `/workspace`

This rollback can be executed in under 30 minutes if critical issues are discovered. 