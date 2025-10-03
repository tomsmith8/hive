import { test } from '@/__tests__/e2e/support/fixtures/test-hooks';
import { expect } from '@playwright/test';
import { AuthPage, DashboardPage } from '@/__tests__/e2e/support/page-objects';
import { createTestWorkspaceScenario, createTestWorkspace } from '@/__tests__/e2e/support/fixtures/database';
import { selectors } from '@/__tests__/e2e/support/fixtures/selectors';

/**
 * Workspace Switching E2E Tests
 * 
 * Tests the ability for users to switch between workspaces using the
 * workspace switcher in the top left of the dashboard.
 */
test.describe('Workspace Switching', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let firstWorkspaceSlug: string;
  let secondWorkspaceSlug: string;
  let firstWorkspaceName: string;
  let secondWorkspaceName: string;

  test.beforeEach(async ({ page }) => {
    // Create first workspace scenario
    const firstScenario = await createTestWorkspaceScenario({
      owner: {
        name: "E2E Test Owner",
        email: "e2e-owner@example.com",
        withGitHubAuth: true,
        githubUsername: "e2e-test-owner",
      },
      workspace: {
        name: "First Workspace",
        slug: `e2e-workspace-1-${Date.now()}`,
        description: "First workspace for switching test",
      },
    });

    // Create second workspace for the same user
    const secondWorkspace = await createTestWorkspace({
      ownerId: firstScenario.owner.id,
      name: "Second Workspace",
      slug: `e2e-workspace-2-${Date.now()}`,
      description: "Second workspace for switching test",
    });

    firstWorkspaceSlug = firstScenario.workspace.slug;
    secondWorkspaceSlug = secondWorkspace.slug;
    firstWorkspaceName = firstScenario.workspace.name;
    secondWorkspaceName = secondWorkspace.name;

    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);

    // Sign in and navigate to first workspace
    await authPage.goto();
    await authPage.signInWithMock();
    await page.waitForURL(/\/w\/.*/, { timeout: 10000 });
  });

  test('should display workspace switcher with current workspace', async ({ page }) => {
    await test.step('verify workspace switcher is visible', async () => {
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      
      await expect(workspaceSwitcher).toBeVisible();
    });
  });

  test('should switch to another workspace from dashboard', async ({ page }) => {
    await test.step('navigate to first workspace dashboard', async () => {
      await dashboardPage.goto(firstWorkspaceSlug);
      await dashboardPage.waitForLoad();
      expect(page.url()).toContain(`/w/${firstWorkspaceSlug}`);
    });

    await test.step('open workspace switcher dropdown', async () => {
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      
      await workspaceSwitcher.click();
      
      // Wait for dropdown to be visible
      await page.waitForSelector('[role="menu"], .dropdown-menu', { 
        state: 'visible',
        timeout: 5000 
      });
    });

    await test.step('select second workspace from dropdown', async () => {
      // Click on the second workspace in the dropdown
      const secondWorkspaceOption = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(secondWorkspaceName, 'i')
      }).first();
      
      await expect(secondWorkspaceOption).toBeVisible();
      await secondWorkspaceOption.click();
    });

    await test.step('verify navigation to second workspace', async () => {
      // Wait for URL to change to second workspace
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}`), { timeout: 10000 });
      
      // Verify we're on the dashboard of the second workspace
      expect(page.url()).toContain(`/w/${secondWorkspaceSlug}`);
      await expect(page.locator(selectors.pageTitle.dashboard)).toBeVisible();
    });

    await test.step('verify workspace switcher shows new workspace', async () => {
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(secondWorkspaceName, 'i') 
      }).first();
      
      await expect(workspaceSwitcher).toBeVisible();
    });
  });

  test('should persist workspace context after reload', async ({ page }) => {
    await test.step('switch to second workspace', async () => {
      await dashboardPage.goto(firstWorkspaceSlug);
      await dashboardPage.waitForLoad();

      // Open dropdown and switch
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      await workspaceSwitcher.click();
      
      await page.waitForSelector('[role="menu"], .dropdown-menu', { state: 'visible' });
      
      const secondWorkspaceOption = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(secondWorkspaceName, 'i')
      }).first();
      await secondWorkspaceOption.click();
      
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}`), { timeout: 10000 });
    });

    await test.step('reload page and verify workspace persists', async () => {
      await page.reload();
      await dashboardPage.waitForLoad();
      
      // Verify we're still on the second workspace
      expect(page.url()).toContain(`/w/${secondWorkspaceSlug}`);
      
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(secondWorkspaceName, 'i') 
      }).first();
      await expect(workspaceSwitcher).toBeVisible();
    });
  });

  test('should switch workspaces and navigate to different pages', async ({ page }) => {
    await test.step('start on first workspace dashboard', async () => {
      await dashboardPage.goto(firstWorkspaceSlug);
      await dashboardPage.waitForLoad();
      expect(page.url()).toContain(`/w/${firstWorkspaceSlug}`);
    });

    await test.step('navigate to tasks page on first workspace', async () => {
      await page.locator(selectors.navigation.tasksLink).first().click();
      await page.waitForURL(new RegExp(`/w/${firstWorkspaceSlug}/tasks`), { timeout: 10000 });
      expect(page.url()).toContain(`/w/${firstWorkspaceSlug}/tasks`);
    });

    await test.step('switch to second workspace from tasks page', async () => {
      // Open workspace switcher
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      await workspaceSwitcher.click();
      
      await page.waitForSelector('[role="menu"], .dropdown-menu', { state: 'visible' });
      
      // Select second workspace
      const secondWorkspaceOption = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(secondWorkspaceName, 'i')
      }).first();
      await secondWorkspaceOption.click();
      
      // Should navigate to dashboard of second workspace
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}`), { timeout: 10000 });
    });

    await test.step('verify we are on second workspace dashboard', async () => {
      expect(page.url()).toContain(`/w/${secondWorkspaceSlug}`);
      await expect(page.locator(selectors.pageTitle.dashboard)).toBeVisible();
      
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(secondWorkspaceName, 'i') 
      }).first();
      await expect(workspaceSwitcher).toBeVisible();
    });
  });

  test('should show both workspaces in dropdown menu', async ({ page }) => {
    await test.step('navigate to first workspace', async () => {
      await dashboardPage.goto(firstWorkspaceSlug);
      await dashboardPage.waitForLoad();
    });

    await test.step('open workspace switcher and verify both workspaces listed', async () => {
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      await workspaceSwitcher.click();
      
      await page.waitForSelector('[role="menu"], .dropdown-menu', { state: 'visible' });
      
      // Verify first workspace is shown (current workspace)
      const firstWorkspaceItem = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(firstWorkspaceName, 'i')
      }).first();
      await expect(firstWorkspaceItem).toBeVisible();
      
      // Verify second workspace is shown in the list
      const secondWorkspaceItem = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(secondWorkspaceName, 'i')
      }).first();
      await expect(secondWorkspaceItem).toBeVisible();
    });
  });

  test('should maintain workspace context when navigating between pages', async ({ page }) => {
    await test.step('switch to second workspace', async () => {
      await dashboardPage.goto(firstWorkspaceSlug);
      await dashboardPage.waitForLoad();

      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(firstWorkspaceName, 'i') 
      }).first();
      await workspaceSwitcher.click();
      
      await page.waitForSelector('[role="menu"], .dropdown-menu', { state: 'visible' });
      
      const secondWorkspaceOption = page.locator('[role="menuitem"]').filter({
        hasText: new RegExp(secondWorkspaceName, 'i')
      }).first();
      await secondWorkspaceOption.click();
      
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}`), { timeout: 10000 });
    });

    await test.step('navigate to tasks page', async () => {
      await page.locator(selectors.navigation.tasksLink).first().click();
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}/tasks`), { timeout: 10000 });
      expect(page.url()).toContain(`/w/${secondWorkspaceSlug}/tasks`);
    });

    await test.step('navigate back to dashboard', async () => {
      await page.locator(selectors.navigation.dashboardLink).first().click();
      await page.waitForURL(new RegExp(`/w/${secondWorkspaceSlug}$`), { timeout: 10000 });
      expect(page.url()).toMatch(new RegExp(`/w/${secondWorkspaceSlug}(/)?$`));
    });

    await test.step('verify still on second workspace', async () => {
      const workspaceSwitcher = page.locator('button').filter({ 
        hasText: new RegExp(secondWorkspaceName, 'i') 
      }).first();
      await expect(workspaceSwitcher).toBeVisible();
    });
  });
});
