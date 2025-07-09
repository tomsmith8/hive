URL Structure Overview
Base Pattern:
Copy/{workspace-id}/{resource}/{id?}/{sub-resource?}/{sub-id?}
🏗️ Complete URL Structure
1. Authentication & Onboarding
Copy/login                          # GitHub OAuth login
/login/callback                 # OAuth callback
/onboarding                     # First-time user setup
/onboarding/workspace          # Create first workspace
2. Workspace Level
Copy/                              # Landing page / workspace selector
/workspaces                    # List all user's workspaces
/workspaces/new               # Create new workspace
/workspaces/{slug}/settings   # Workspace settings
/workspaces/{slug}/members    # Workspace members management
3. Main App (Workspace Scoped)
Copy/{workspace-slug}/dashboard                    # Main dashboard
/{workspace-slug}/products                     # Products list
/{workspace-slug}/roadmaps                     # Roadmaps list
/{workspace-slug}/tasks                        # All tasks view
/{workspace-slug}/team                         # Team members
/{workspace-slug}/settings                     # Workspace settings
4. Product Management
Copy# Products
/{workspace-slug}/products                     # Products list
/{workspace-slug}/products/new                 # Create product
/{workspace-slug}/products/{product-id}        # Product detail
/{workspace-slug}/products/{product-id}/edit   # Edit product
/{workspace-slug}/products/{product-id}/settings # Product settings

# Features (within products)
/{workspace-slug}/products/{product-id}/features              # Features list
/{workspace-slug}/products/{product-id}/features/new          # Create feature
/{workspace-slug}/products/{product-id}/features/{feature-id} # Feature detail
/{workspace-slug}/products/{product-id}/features/{feature-id}/edit # Edit feature

# User Stories (within features)
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories              # Stories list
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories/new          # Create story
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories/{story-id}   # Story detail
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories/{story-id}/edit # Edit story

# Tasks (within stories or features)
/{workspace-slug}/products/{product-id}/features/{feature-id}/tasks                # Feature tasks
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories/{story-id}/tasks # Story tasks
/{workspace-slug}/products/{product-id}/features/{feature-id}/stories/{story-id}/tasks/{task-id} # Task detail

# Requirements (within features)
/{workspace-slug}/products/{product-id}/features/{feature-id}/requirements         # Requirements list
/{workspace-slug}/products/{product-id}/features/{feature-id}/requirements/new     # Create requirement
/{workspace-slug}/products/{product-id}/features/{feature-id}/requirements/{req-id} # Requirement detail
5. Roadmap Management
Copy/{workspace-slug}/roadmaps                     # Roadmaps list
/{workspace-slug}/roadmaps/new                 # Create roadmap
/{workspace-slug}/roadmaps/{roadmap-id}        # Roadmap detail
/{workspace-slug}/roadmaps/{roadmap-id}/edit   # Edit roadmap
/{workspace-slug}/roadmaps/{roadmap-id}/items  # Roadmap items
6. Task Management (Global Views)
Copy/{workspace-slug}/tasks                        # All tasks
/{workspace-slug}/tasks/my                     # My assigned tasks
/{workspace-slug}/tasks/{task-id}              # Task detail (global)
/{workspace-slug}/tasks/new                    # Create task (global)
7. Team & Collaboration
Copy/{workspace-slug}/team                         # Team members
/{workspace-slug}/team/invite                  # Invite members
/{workspace-slug}/team/{user-id}               # User profile
8. Infrastructure (Repositories & Swarms)
Copy/{workspace-slug}/repositories                 # Repositories list
/{workspace-slug}/repositories/new             # Add repository
/{workspace-slug}/repositories/{repo-id}       # Repository detail
/{workspace-slug}/swarm                        # Swarm management
/{workspace-slug}/swarm/setup                  # Swarm setup
🔧 Implementation Examples
Next.js File Structure:
Copypages/
├── index.js                                   # Landing/workspace selector
├── login/
│   ├── index.js                              # /login
│   └── callback.js                           # /login/callback
├── onboarding/
│   ├── index.js                              # /onboarding
│   └── workspace.js                          # /onboarding/workspace
├── workspaces/
│   ├── index.js                              # /workspaces
│   └── new.js                                # /workspaces/new
└── [workspace]/
    ├── dashboard.js                          # /{workspace}/dashboard
    ├── products/
    │   ├── index.js                          # /{workspace}/products
    │   ├── new.js                            # /{workspace}/products/new
    │   └── [productId]/
    │       ├── index.js                      # /{workspace}/products/{id}
    │       ├── edit.js                       # /{workspace}/products/{id}/edit
    │       └── features/
    │           ├── index.js                  # /{workspace}/products/{id}/features
    │           ├── new.js                    # /{workspace}/products/{id}/features/new
    │           └── [featureId]/
    │               ├── index.js              # /{workspace}/products/{id}/features/{id}
    │               ├── edit.js               # /{workspace}/products/{id}/features/{id}/edit
    │               └── stories/
    │                   ├── index.js          # /{workspace}/products/{id}/features/{id}/stories
    │                   ├── new.js            # /{workspace}/products/{id}/features/{id}/stories/new
    │                   └── [storyId]/
    │                       ├── index.js      # /{workspace}/products/{id}/features/{id}/stories/{id}
    │                       └── tasks/
    │                           └── [taskId].js # /{workspace}/products/{id}/features/{id}/stories/{id}/tasks/{id}
    ├── roadmaps/
    │   ├── index.js                          # /{workspace}/roadmaps
    │   ├── new.js                            # /{workspace}/roadmaps/new
    │   └── [roadmapId]/
    │       ├── index.js                      # /{workspace}/roadmaps/{id}
    │       └── edit.js                       # /{workspace}/roadmaps/{id}/edit
    ├── tasks/
    │   ├── index.js                          # /{workspace}/tasks
    │   ├── my.js                             # /{workspace}/tasks/my
    │   ├── new.js                            # /{workspace}/tasks/new
    │   └── [taskId].js                       # /{workspace}/tasks/{id}
    ├── team/
    │   ├── index.js                          # /{workspace}/team
    │   ├── invite.js                         # /{workspace}/team/invite
    │   └── [userId].js                       # /{workspace}/team/{id}
    └── settings.js                           # /{workspace}/settings
🎯 URL Pattern Rules
1. Consistent Hierarchy
CopyWorkspace → Product → Feature → Story → Task
/{workspace}/{products}/{product-id}/{features}/{feature-id}/{stories}/{story-id}/{tasks}/{task-id}
2. Actions & Views
Copy# Resource actions
/new          # Create new
/edit         # Edit existing
/settings     # Settings/config

# Special views
/my           # User-specific view
/all          # All items view
3. Query Parameters for Filters/Views
Copy/{workspace}/products?view=grid                    # Grid view
/{workspace}/products?status=active                # Filter by status
/{workspace}/tasks?assignee=me&status=in_progress  # Multiple filters
/{workspace}/roadmaps/{id}?quarter=Q1              # Time-based filters
4. Modal/Overlay URLs
Copy# Task detail modal while staying on products page
/{workspace}/products/{product-id}?task={task-id}

# Feature detail modal while staying on roadmap
/{workspace}/roadmaps/{roadmap-id}?feature={feature-id}
🔍 SEO & Bookmarking Considerations
Human-Readable URLs:
Copy/acme-corp/products/mobile-app/features/user-auth
/startup-x/roadmaps/q1-2024
/my-company/tasks/my
Canonical URLs:
Copy# Task can be accessed from multiple contexts
/{workspace}/tasks/{task-id}                       # Canonical
/{workspace}/products/{product-id}/features/{feature-id}/stories/{story-id}/tasks/{task-id} # Contextual
🚀 API Routes (Parallel Structure)
Copy/api/workspaces
/api/workspaces/{slug}/products
/api/workspaces/{slug}/products/{id}/features
/api/workspaces/{slug}/products/{id}/features/{id}/stories
/api/workspaces/{slug}/tasks
/api/workspaces/{slug}/roadmaps
This URL structure is:

✅ Hierarchical - Follows your data model
✅ Intuitive - Easy to understand and predict
✅ RESTful - Follows REST conventions
✅ Bookmarkable - All states can be bookmarked
✅ SEO-friendly - Human-readable slugs
✅ Scalable - Easy to extend

Key Issues & Recommendations
1. Missing Workspace Context
Issue: Your current routes don't include workspace slugs, but your database has full workspace support.
Recommendation: Implement workspace-scoped routing immediately.
2. Missing Product Management Layer
Issue: Your database has Products → Features → User Stories → Tasks hierarchy, but routes go directly to features.
Recommendation: Add the complete product management routing structure.
3. Inconsistent Route Patterns
Issue: Current routes mix /dashboard/* with workspace-less patterns.
Recommendation: Standardize on /{workspace-slug}/* pattern.

Phase 1: Foundation (Workspace Support)
/                           # Landing/workspace selector
/workspaces                 # List user's workspaces  
/workspaces/new            # Create new workspace

Phase 2: Workspace-Scoped Routes
/{workspace-slug}/dashboard              # Main workspace dashboard
/{workspace-slug}/roadmap               # Roadmaps list  
/{workspace-slug}/tasks                  # Tasks overview
/{workspace-slug}/settings               # Workspace settings