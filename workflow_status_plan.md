## Overview

Implement workflow status tracking system that separates chat message flow from workflow execution status, using dual webhook architecture.

---

## Architecture Components

### 1. Database Schema Changes

**File:** `/prisma/schema.prisma`

- Add `WorkflowStatus` enum with values: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `ERROR`, `HALTED`, `FAILED`
- Add `workflowStatus` field to `Task` model (nullable, defaults to `PENDING`)
- Add optional timestamps: `workflowStartedAt`, `workflowCompletedAt`

---

### 2. New Webhook Endpoint

**File:** `/src/app/api/stakwork/webhook/route.ts` (new)

- Accept `POST` requests from Stakwork with status updates
- Update `Task.workflowStatus` in database
- Trigger Pusher broadcast to task channel
- Handle error cases and logging
- Follow existing API route patterns from `/api/chat/response/route.ts`

Stakwork payload for status updates (use `project_status`):
```
{
    "project_output": {},
    "workflow_id": 8268,
    "workflow_version_id": 81307,
    "workflow_version": 81307,
    "project_status": "completed"
}
```

---

### 3. Stakwork Integration Updates

**File:** `/src/app/api/chat/message/route.ts` (modify existing)

- Update `StakworkWorkflowPayload` interface to include root-level `webhook_url`
- Keep existing `webhookUrl` in `set_var` for chat responses
- Add new `webhook_url` pointing to `/api/stakwork/webhook`
- Set `workflowStatus: 'IN_PROGRESS'` after successful Stakwork call
- Handle Stakwork call failures by setting `workflowStatus: 'FAILED'`

---

### 4. Pusher Integration Extension

**File:** `/src/lib/pusher.ts` (modify existing)

- Add new event type: `WORKFLOW_STATUS_UPDATE` to `PUSHER_EVENTS`
- Use existing task channel pattern: `task-${taskId}`
- Broadcast workflow status changes to subscribed clients

---

### 5. Frontend Status Handling

**File:** `/src/hooks/usePusherConnection.ts` or new hook (modify/create)

- Listen for `WORKFLOW_STATUS_UPDATE` events
- Update task state with new workflow status
- Handle status transitions and UI updates

---

### 6. UI Components

**Files:**

- `/src/components/ui/workflow-status-badge.tsx` (new)
- Task chat page components (modify existing)

**Features:**

- Create status badge component with visual indicators
- Integrate status display into chat interface
- Show status transitions (loading states, success, errors)
- Use existing design system patterns

## Data Flow Architecture

  1. User sends message
     ↓
  2. /api/chat/message calls Stakwork with:
     - set_var.webhookUrl: "/api/chat/response" (chat messages)
     - webhook_url: "/api/stakwork/webhook" (status updates)
     - Sets workflowStatus: 'IN_PROGRESS'
     ↓
  3. Stakwork processes workflow
     ↓
  4. Stakwork sends status updates to /api/stakwork/webhook
     ↓
  5. Webhook updates Task.workflowStatus in DB
     ↓
  6. Pusher broadcasts WORKFLOW_STATUS_UPDATE to task channel
     ↓
  7. Frontend receives update and renders new status

## Dual Webhook System

- **Chat Messages:** `/api/chat/response` (existing, unchanged)
- **Workflow Status:** `/api/stakwork/webhook` (new)

**This separation allows:**

- Independent handling of chat responses vs. workflow status
- Different error handling strategies for each concern
- Cleaner architecture with single responsibility per endpoint

---

## Implementation Order

1. Database schema changes and migration  
2. New webhook endpoint creation  
3. Stakwork integration updates (dual webhook URLs)  
4. Pusher event extension  
5. Frontend status handling  
6. UI component creation and integration  
7. Testing and error handling refinement

---

## Key Benefits

- **Separation of Concerns:** Chat vs. workflow status tracking  
- **Real-time Updates:** Immediate status feedback via Pusher  
- **Robust Error Handling:** Independent failure modes for chat/workflow  
- **Extensible:** Easy to add more workflow status types  
- **Maintains Existing Functionality:** Chat system unchanged