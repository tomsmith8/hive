1) add middleware logic to route all requests to onboarding/workspace if authenticated user has 
2) change all routing base url for workspaceId
3) add swarm creation to onboarding flow

Base Pattern:

If the user logs in an authenticates we take them to their workspace
- if the user doesn't have one, take them to /workspace/onboarding

/{workspace-id}/

{workspace-slug}/dashboard                    # Main dashboard
/{workspace-slug}/tasks                        # All tasks view
/{workspace-slug}/roadmaps                    # Roadmaps list
/{workspace-slug}/code-graph                    # codegraph wizard
/{workspace-slug}/settings                     # Workspace settings



Derisking
- Roadmap -> Miro style roadmap of nodes (workspace + missions) - >objectives -> features.
- filtering
    - kanban
    - list view
    - filters
zooming in/out can you go to the feature page



Onboarding flow:
- Automatic Setup / Manual setup 