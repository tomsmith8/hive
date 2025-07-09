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

## Critical Implementation Corrections

### **⚠️ Key Technical Fixes Required:**

#### **1. Middleware Edge-Safety**
- **Problem:** Edge middleware cannot call database directly
- **Solution:** Keep middleware lightweight with regex validation only, move DB calls to layout.tsx
- **Pattern:** `middleware.ts` → slug format validation → `[workspace]/layout.tsx` → actual workspace validation

#### **2. Route Priority & Collision Prevention**
- **Problem:** Static `/workspace` conflicts with dynamic `/[workspace]`
- **Solution:** Use route groups `(legacy)` and implement reserved slug list
- **Reserved Slugs:** `['api', 'auth', 'favicon.ico', 'robots.txt', 'workspace', 'workspaces', '_next']`

#### **3. Early Testing Strategy**
- **Problem:** No testing until Day 9 risks late-stage bugs
- **Solution:** Playwright smoke tests from Day 1, test each migration step immediately

#### **4. App Router Optimizations**
- **Add:** `export const dynamic = 'force-dynamic'` to API routes needing per-request auth
- **Use:** React Suspense boundaries in WorkspaceProvider
- **Implement:** Tagged cache invalidation with `revalidateTag('workspace-' + id)`

---

## Phase 1: Core Infrastructure Setup (Days 1-2)

### Step 1: Update Workspace Service Layer
**Files:** `src/services/workspace.ts`
- [ ] **Add `getWorkspaceBySlug(slug: string, userId: string)` function** - Retrieves a specific workspace by its slug and validates user access in a single operation
- [ ] **Add `getDefaultWorkspaceForUser(userId: string)` function** - Gets the user's primary/default workspace for automatic redirection after login
- [ ] **Add `getUserWorkspaces(userId: string)` function with role checking** - Returns all workspaces the user has access to, including their role in each workspace
- [ ] **Add workspace access validation functions** - Utility functions to check if a user can read/write/admin a specific workspace
- [ ] **Update error handling for workspace not found scenarios** - Standardize error responses for invalid workspace slugs or access denied cases
- [ ] **⚠️ Add reserved slug validation** - Implement `validateWorkspaceSlug(slug)` with reserved words list to prevent conflicts
- [ ] **⚠️ Add slug history support** - Support for workspace slug changes with automatic redirects from old slugs

### Step 2: Create Workspace Context & Hooks
**Files:** 
- [ ] **`src/contexts/WorkspaceContext.tsx` - React context for current workspace** - Provides workspace data, user role, and workspace switching functionality to all child components
- [ ] **`src/hooks/useWorkspace.ts` - Hook for workspace operations** - Encapsulates workspace CRUD operations, switching between workspaces, and loading states
- [ ] **`src/hooks/useWorkspaceAccess.ts` - Hook for access control validation** - Provides easy access to permission checking functions (canRead, canWrite, canAdmin) for the current workspace
- [ ] **⚠️ Implement WorkspaceProvider with Suspense** - Wrap children in React Suspense boundary for native App Router pattern
- [ ] **⚠️ Store both slug and ID in context** - Context shape: `{ slug: string, id: string, role: string, ...workspace }`

### Step 3: Update Middleware for Workspace Routing (EDGE-SAFE)
**Files:** `middleware.ts`
- [ ] **⚠️ LIGHTWEIGHT slug validation only** - Parse URLs with regex to validate slug format (no DB calls)
- [ ] **⚠️ Check reserved slug list** - Block access to reserved slugs like 'api', 'auth', 'favicon.ico'
- [ ] **⚠️ JWT-based workspace validation** - Validate workspace access using JWT claims, not database calls
- [ ] **Handle user with no workspaces → redirect to onboarding** - Detect users without any workspace access and send them through the workspace creation flow
- [ ] **Update route matching patterns to include both `/workspace/*` and `/[workspace-slug]/*`** - Support both old temporary routes and new workspace-scoped routes during migration
- [ ] **⚠️ Add history.replaceState handling** - Ensure proper browser back-button behavior during migration

### Step 4: Setup Early Testing Infrastructure (Day 1)
**Files:** 
- [ ] **⚠️ Setup Playwright smoke tests** - Create basic tests that verify routes return 200 and contain expected elements
- [ ] **⚠️ Add CI smoke test pipeline** - Run smoke tests on every PR to catch regressions early
- [ ] **⚠️ Create workspace test fixtures** - Setup test workspaces and users for consistent testing
- [ ] **⚠️ Test reserved slug enforcement** - Verify reserved slugs are properly blocked

## Phase 2: Authentication & User Flow Setup (Day 2)

### Step 5: Update Authentication Flow
**Files:** 
- [ ] **`src/app/auth/signin/page.tsx` - Change redirect from `/dashboard` to workspace logic** - Replace hardcoded dashboard redirect with intelligent workspace resolution based on user's workspace access
- [ ] **⚠️ `src/lib/auth/nextauth.ts` - Embed defaultWorkspaceSlug in JWT claims** - Store workspace slug in JWT to avoid extra DB calls on each request
- [ ] **Add post-login workspace resolution logic** - Implement logic to determine where to send users: onboarding (no workspaces), direct to workspace (one workspace), or workspace selector (multiple workspaces)
- [ ] **⚠️ Implement one-redirect login flow** - Use JWT slug to redirect directly to `/{slug}` instead of multiple redirects

### Step 6: Create Workspace Selection & Landing Pages
**Files:**
- [ ] **`src/app/page.tsx` - Landing page with workspace selector** - Root page that shows workspace selection for users with multiple workspaces or redirects appropriately for users with single/no workspaces
- [ ] **`src/app/workspaces/page.tsx` - List all user workspaces** - Administrative page showing all workspaces the user has access to with options to switch, create new, or manage existing workspaces
- [ ] **`src/app/workspaces/new/page.tsx` - Create new workspace** - Alternative workspace creation flow for users who already have workspaces but want to create additional ones
- [ ] **`src/components/WorkspaceSelector.tsx` - Dropdown/modal for workspace switching** - Reusable component for quick workspace switching from navigation or other UI elements
- [ ] **⚠️ Add router.prefetch for workspace switching** - Prefetch next workspace on hover for instant switching

---

## Phase 3: Incremental Route Migration (Days 3-6)

### Step 7: Setup Route Groups (Day 3)
**Goal:** Proper route organization to avoid conflicts
- [ ] **⚠️ Create legacy route group `src/app/(legacy)/workspace/`** - Move existing workspace routes into route group to avoid collision
- [ ] **⚠️ Create new workspace routes `src/app/[workspace]/`** - Establish clean dynamic routes without conflicts
- [ ] **⚠️ Configure route priority explicitly** - Ensure predictable routing behavior between legacy and new routes
- [ ] **Update imports for route group structure** - Update all import statements to reflect new route organization

### Step 8: Create Workspace-Scoped Route Structure (Day 3-4)
**Goal:** Establish new `/[workspace-slug]/*` routes alongside legacy routes
**New Directory Structure:**
```
src/app/
├── (legacy)/
│   └── workspace/               # Temporary fallback routes (route group)
│       ├── layout.tsx          # Uses WorkspaceContext for consistency
│       ├── page.tsx            # Dashboard home
│       ├── roadmap/page.tsx    # Roadmap features
│       └── ...                 # Other existing pages
├── [workspace]/                # New workspace-scoped routes
│   ├── layout.tsx              # ⚠️ DB calls happen HERE, not middleware
│   └── ...                     # Pages migrated one by one
```

- [ ] **⚠️ Create `src/app/[workspace]/layout.tsx` with SERVER-SIDE workspace validation** - Move all DB calls from middleware to this server component
- [ ] **⚠️ Implement proper error boundaries** - Handle workspace not found, access denied with user-friendly error pages
- [ ] **⚠️ Add cache invalidation tags** - Use `revalidateTag('workspace-' + workspaceId)` for efficient cache management
- [ ] **⚠️ Setup Suspense boundaries** - Implement loading states for workspace data fetching

### Step 9: Migrate Pages One by One (Days 4-6)
**⚠️ Test each page immediately after migration**

#### 9a. Migrate Dashboard Home (Day 4)
- [ ] **Copy `src/app/(legacy)/workspace/page.tsx` to `src/app/[workspace]/page.tsx`** - Create workspace-scoped version of dashboard home page with identical functionality
- [ ] **⚠️ Update navigation to use workspace context, not props** - Use `useRouter().push({ pathname: '/[workspace]/tasks', query: { workspace } })`
- [ ] **⚠️ Add `export const dynamic = 'force-dynamic'` if needed** - Ensure per-request auth for any API calls
- [ ] **⚠️ Run Playwright tests** - Verify page loads correctly and workspace scoping works
- [ ] **⚠️ Test workspace switching from this page** - Ensure switcher works correctly

#### 9b. Migrate Roadmap Pages (Day 4-5)
- [ ] **Copy roadmap pages to `src/app/[workspace]/roadmap/`** - Migrate main roadmap and feature detail pages
- [ ] **Update all roadmap components to use workspace context** - Modify roadmap components to filter and display only features belonging to the current workspace
- [ ] **⚠️ Update API routes with workspace validation** - Add workspace scoping to all roadmap API endpoints
- [ ] **⚠️ Add intercepting routes for modals** - Consider `/@modal` pattern for zero-duplication entity creation
- [ ] **⚠️ Test feature CRUD within workspace scope** - Verify all roadmap functionality respects workspace boundaries

#### 9c. Migrate Tasks Page (Day 5)
- [ ] **Copy `src/app/(legacy)/workspace/tasks/page.tsx` to `src/app/[workspace]/tasks/page.tsx`** - Migrate task management page with workspace-specific task filtering
- [ ] **Update task filtering/loading to be workspace-scoped** - Ensure task lists only show tasks belonging to the current workspace
- [ ] **⚠️ Update API routes with workspace validation** - Modify task CRUD operations to include workspace validation and scoping
- [ ] **⚠️ Test task operations within workspace** - Verify task functionality is properly isolated

#### 9d. Migrate Settings Page (Day 5)
- [ ] **Copy settings page to `src/app/[workspace]/settings/page.tsx`** - Migrate settings page with both user and workspace-specific settings
- [ ] **Add workspace-specific settings sections** - Implement settings that are specific to the current workspace (name, description, member management)
- [ ] **⚠️ Add workspace slug rename functionality** - Allow workspace name/slug changes with proper redirect handling
- [ ] **⚠️ Test settings changes isolation** - Verify workspace settings only affect current workspace

#### 9e. Migrate Code Graph Page (Day 6)
- [ ] **Copy code graph page to `src/app/[workspace]/code-graph/page.tsx`** - Migrate with workspace-scoped repository access
- [ ] **Update to use workspace-scoped repositories** - Ensure code graph only shows repositories belonging to current workspace
- [ ] **⚠️ Update API routes with workspace validation** - Scope all code graph API calls to workspace
- [ ] **⚠️ Test code graph generation within workspace** - Verify functionality is workspace-isolated

#### 9f. Migrate Stakgraph Page (Day 6)
- [ ] **Copy stakgraph page to `src/app/[workspace]/stakgraph/page.tsx`** - Migrate with workspace-scoped stakeholder data
- [ ] **Update to use workspace-scoped swarm data** - Ensure stakeholder graphs only display workspace-relevant data
- [ ] **⚠️ Test stakeholder operations within workspace scope** - Verify proper workspace isolation

---

## Phase 4: Component & API Updates (Days 7-8)

### Step 10: Update Navigation Components (Day 7)
- [ ] **Update `src/components/DashboardLayout.tsx` for workspace context integration** - Modify main layout component to work with new routing
- [ ] **⚠️ Update `src/components/Sidebar.tsx` to use context-based navigation** - Generate URLs using workspace from context, not props
- [ ] **Update `src/components/NavUser.tsx` to add workspace switching functionality** - Add workspace switching dropdown with prefetch
- [ ] **⚠️ Add workspace indicator to navigation** - Display current workspace name/slug clearly
- [ ] **⚠️ Implement Link wrapper for URL auto-correction** - Automatically fix any stale URLs

### Step 11: Update API Routes for Workspace Scoping (Day 7)
- [ ] **⚠️ Add `export const dynamic = 'force-dynamic'` to auth-dependent routes** - Prevent caching of user-specific data
- [ ] **Update `src/app/api/workspaces/route.ts` for new workspace operations** - Add endpoints for workspace switching, validation, and listing
- [ ] **⚠️ Update all API routes to validate workspace access** - Ensure all data operations include workspace scoping and access validation
- [ ] **⚠️ Implement workspace-scoped cache invalidation** - Use tagged caching for efficient workspace data management
- [ ] **⚠️ Remove any DB calls from middleware** - Ensure middleware stays edge-safe

### Step 12: Update Components with Workspace Context (Day 8)
- [ ] **Update all components to use workspace context** - Modify components to consume workspace data through context
- [ ] **⚠️ Add branded TypeScript types** - Create `type WorkspaceSlug = string & { __brand: 'WorkspaceSlug' }` for type safety
- [ ] **⚠️ Update components to use workspace ID for API calls** - Use workspace ID internally while displaying slug in URLs
- [ ] **⚠️ Add Storybook stories for workspace-aware components** - Create regression testing for workspace components

---

## Phase 5: Data Layer & Service Updates (Day 8)

### Step 13: Update Hooks and Services
- [ ] **Update all hooks to add workspace scoping** - Ensure all data hooks operate within workspace boundaries
- [ ] **⚠️ Implement parallel data fetching with cache()** - Use new App Router cache API for deduped workspace data
- [ ] **⚠️ Add revalidateTag support to all workspace operations** - Enable efficient cache invalidation
- [ ] **Update all services to include workspace context** - Modify service layer for workspace-scoped operations

### Step 14: Update Type Definitions
- [ ] **Update `src/types/workspace.ts` to add workspace context types** - Define comprehensive workspace-related types
- [ ] **⚠️ Add branded slug types** - Implement type-safe slug handling throughout application
- [ ] **Update all type files to include workspace context** - Ensure type safety across workspace-scoped operations

---

## Phase 6: Testing & Validation (Days 9-10)

### Step 15: Comprehensive Testing (Day 9)
- [ ] **⚠️ Run full Playwright test suite** - Execute comprehensive tests including smoke tests that ran throughout migration
- [ ] **Test all user flows end-to-end** - Verify complete user journeys work correctly
- [ ] **⚠️ Test reserved slug enforcement** - Verify users cannot create workspaces with reserved names
- [ ] **⚠️ Test workspace slug rename flow** - Verify old URLs redirect properly to new slugs
- [ ] **⚠️ Load test workspace switching** - Ensure performance remains good under load
- [ ] **Test edge cases and error scenarios** - Verify proper error handling for all edge cases

### Step 16: Performance & UX Testing (Day 9)
- [ ] **⚠️ Test edge middleware performance** - Verify middleware stays fast without DB calls
- [ ] **Test workspace data caching** - Verify cache invalidation works correctly
- [ ] **⚠️ Test browser back-button behavior** - Ensure proper navigation history handling
- [ ] **⚠️ Test social sharing with Open Graph tags** - Verify link previews work correctly

---

## Phase 7: Cleanup & Launch (Day 10)

### Step 17: Remove Legacy Routes & Add Redirects
- [ ] **⚠️ Add next.config.js redirects** - Implement static 308 redirects for `/workspace/*` → `/{defaultSlug}/*`
- [ ] **Remove `src/app/(legacy)/workspace/` directory** - Delete legacy routes once migration confirmed working
- [ ] **⚠️ Implement client-side URL correction** - Handle any remaining stale URLs gracefully
- [ ] **⚠️ Add slug history redirects** - Ensure old workspace slugs redirect to new ones

### Step 18: Final Optimizations (Day 10)
- [ ] **⚠️ Implement edge-friendly slug cache** - Add KV/Redis cache for slug→ID mapping if needed
- [ ] **⚠️ Setup workspace data prefetching** - Optimize workspace switching with prefetch
- [ ] **⚠️ Add monitoring and analytics** - Track workspace switching and performance metrics
- [ ] **⚠️ Feature flag rollout** - Ship behind `NEXT_PUBLIC_WS_ROUTING=v2` for gradual rollout

---

## Implementation Timeline

### **Total Estimated Time: 10 days (adjusted for safety)**

- **Day 1:** Infrastructure + Testing setup + Reserved slug validation
- **Day 2:** Auth flow with JWT + Edge-safe middleware
- **Day 3:** Route groups + Legacy migration + Early testing
- **Days 4-6:** Page migration (with immediate testing each step)
- **Days 7-8:** Component/API updates + Performance optimization
- **Day 9:** Comprehensive testing + Load testing
- **Day 10:** Cleanup + Feature flag rollout + Monitoring

---

## Critical Success Factors

### **Edge-Safe Architecture:**
- **No DB calls in middleware** - All database operations happen in server components
- **JWT-based workspace validation** - Fast edge validation without database hits
- **Lightweight slug validation** - Regex-based format checking in middleware

### **Route Collision Prevention:**
- **Reserved slug list** - Prevent conflicts with static assets and API routes
- **Route groups for organization** - Clean separation between legacy and new routes
- **Proper route priority configuration** - Predictable routing behavior

### **Early Testing & Safety:**
- **Smoke tests from Day 1** - Catch regressions immediately
- **Test each migration step** - Verify functionality before moving to next page
- **Feature flag rollout** - Gradual rollout with ability to quickly rollback

### **Performance & UX:**
- **Tagged cache invalidation** - Efficient workspace data management
- **Prefetch workspace switching** - Instant workspace transitions
- **Proper browser history handling** - Smooth back-button behavior

---

## Emergency Rollback Plan

### **If Critical Issues Arise:**
1. **Disable feature flag** - Set `NEXT_PUBLIC_WS_ROUTING=v1` to revert to legacy routes
2. **Redirect traffic** - Update redirects to point back to legacy routes
3. **Database rollback** - No schema changes needed, just feature flag toggle
4. **Monitoring alerts** - Set up alerts for error rates and performance regressions

**Rollback time: Under 5 minutes with feature flags** 