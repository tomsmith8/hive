# Workspace E2E Tests

This directory contains end-to-end tests for workspace functionality.

## Test Files

### `workspace-membership.spec.ts`
Tests for workspace member management:
- Inviting new members
- Updating member roles
- Removing members
- Permission validation

### `workspace-details-edit.spec.ts`
Tests for editing workspace details:
- Updating workspace name
- Updating workspace slug (with automatic redirect)
- Updating workspace description
- Clearing description
- Form validation (invalid slug format, empty name)
- Button state management (disabled when pristine, enabled when dirty)
- Data persistence after page reload

## Running Tests

Run all workspace tests:
```bash
npm run test:e2e -- workspace
```

Run a specific test file:
```bash
npm run test:e2e -- workspace-details-edit.spec.ts
```

Run a specific test:
```bash
npm run test:e2e -- workspace-details-edit.spec.ts -g "should update workspace name"
```

## Test Structure

All tests follow the Page Object Model pattern:
- **Page Objects**: `/src/__tests__/e2e/support/page-objects/`
- **Fixtures**: `/src/__tests__/e2e/support/fixtures/`
- **Selectors**: `/src/__tests__/e2e/support/fixtures/selectors.ts`

## Test Coverage

### Workspace Details Editing
- ✅ Display current workspace values
- ✅ Update name only
- ✅ Update slug only (with redirect)
- ✅ Update description only
- ✅ Update all fields at once
- ✅ Clear description
- ✅ Validate slug format
- ✅ Validate required name
- ✅ Button state management
- ✅ Data persistence

### Workspace Membership
- ✅ Invite members with different roles
- ✅ Update member roles
- ✅ Remove members
- ✅ Data persistence
