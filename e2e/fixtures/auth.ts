import { test as base, expect, type Page } from '@playwright/test';

/** Seed-dev roles used by UM UI smoke (password shared unless overridden). */
export type SeedRole = 'admin' | 'pm' | 'employee' | 'head' | 'creative_head';

export interface SeedAccount {
  email: string;
  password: string;
  role: SeedRole;
}

const defaultPassword = process.env.E2E_PASSWORD ?? 'ps123';

/** Credentials via env — seed passwords in docs are OK as fixtures. */
export const SEED_ACCOUNTS: Record<SeedRole, SeedAccount> = {
  admin: {
    role: 'admin',
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@pokeslide.dev',
    password: process.env.E2E_ADMIN_PASSWORD ?? defaultPassword,
  },
  pm: {
    role: 'pm',
    email: process.env.E2E_PM_EMAIL ?? 'pm@pokeslide.dev',
    password: process.env.E2E_PM_PASSWORD ?? defaultPassword,
  },
  employee: {
    role: 'employee',
    email: process.env.E2E_EMPLOYEE_EMAIL ?? 'employee@pokeslide.dev',
    password: process.env.E2E_EMPLOYEE_PASSWORD ?? defaultPassword,
  },
  head: {
    role: 'head',
    email: process.env.E2E_HEAD_EMAIL ?? 'head@pokeslide.dev',
    password: process.env.E2E_HEAD_PASSWORD ?? defaultPassword,
  },
  creative_head: {
    role: 'creative_head',
    email: process.env.E2E_CREATIVE_HEAD_EMAIL ?? 'creative-head@pokeslide.dev',
    password: process.env.E2E_CREATIVE_HEAD_PASSWORD ?? defaultPassword,
  },
};

export async function loginAs(page: Page, role: SeedRole): Promise<void> {
  const account = SEED_ACCOUNTS[role];
  await page.goto('/login');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
}

export async function logout(page: Page): Promise<void> {
  // Avatar dropdown in TopHeader
  await page.locator('header').getByRole('button').filter({ has: page.locator('.ant-avatar') }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Sidebar helpers — Ant Design Menu accessible names include icon aria
 * (e.g. "user Users"), so match by substring rather than exact label.
 */
export async function expectSidebarHasUsers(page: Page, visible: boolean): Promise<void> {
  const users = page.locator('aside').getByRole('menuitem', { name: /\bUsers\b/ });
  if (visible) {
    await expect(users).toBeVisible();
  } else {
    await expect(users).toHaveCount(0);
  }
}

export async function expectSidebarHasRoles(page: Page, visible: boolean): Promise<void> {
  const aside = page.locator('aside');
  const settings = aside.getByRole('menuitem', { name: /\bSettings\b/ });
  const rolesItem = aside.getByRole('menuitem', { name: /Roles & Permissions/ });

  if (!visible) {
    // Settings submenu may be absent entirely for PM/employee, or present without Roles.
    if ((await settings.count()) === 0) {
      await expect(rolesItem).toHaveCount(0);
      return;
    }
    // Open submenu if closed
    const expanded = await settings.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await settings.click();
    }
    await expect(rolesItem).toHaveCount(0);
    return;
  }

  await expect(settings).toBeVisible();
  const expanded = await settings.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await settings.click();
  }
  await expect(rolesItem).toBeVisible();
}

/** Projects nav — default MANAGE_PROJECTS for all seed roles. */
export async function expectSidebarHasProjects(page: Page, visible: boolean): Promise<void> {
  const projects = page.locator('aside').getByRole('menuitem', { name: /\bProjects\b/ });
  if (visible) {
    await expect(projects).toBeVisible();
  } else {
    await expect(projects).toHaveCount(0);
  }
}

/** Settings → Department management — default MANAGE_DEPARTMENTS for Head/CH/Admin. */
export async function expectSidebarHasDepartments(page: Page, visible: boolean): Promise<void> {
  const aside = page.locator('aside');
  const settings = aside.getByRole('menuitem', { name: /\bSettings\b/ });
  const deptItem = aside.getByRole('menuitem', { name: /Department management/ });

  if (!visible) {
    if ((await settings.count()) === 0) {
      await expect(deptItem).toHaveCount(0);
      return;
    }
    const expanded = await settings.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await settings.click();
    }
    await expect(deptItem).toHaveCount(0);
    return;
  }

  await expect(settings).toBeVisible();
  const expanded = await settings.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await settings.click();
  }
  await expect(deptItem).toBeVisible();
}


export async function expectSidebarHasTitleManagement(
  page: Page,
  visible: boolean,
): Promise<void> {
  const aside = page.locator('aside');
  const item = aside.getByRole('menuitem', { name: /Title management/ });

  if (!visible) {
    if (!(await openSettingsSubmenu(page))) {
      await expect(item).toHaveCount(0);
      return;
    }
    await expect(item).toHaveCount(0);
    return;
  }

  await expect(aside.getByRole('menuitem', { name: /\bSettings\b/ })).toBeVisible();
  await openSettingsSubmenu(page);
  await expect(item).toBeVisible();
}

/** Capacity formula — same MANAGE_TITLES gate as Title management. */

export async function expectSidebarHasCapacityFormula(
  page: Page,
  visible: boolean,
): Promise<void> {
  const aside = page.locator('aside');
  const item = aside.getByRole('menuitem', { name: /Capacity formula/ });

  if (!visible) {
    if (!(await openSettingsSubmenu(page))) {
      await expect(item).toHaveCount(0);
      return;
    }
    await expect(item).toHaveCount(0);
    return;
  }

  await expect(aside.getByRole('menuitem', { name: /\bSettings\b/ })).toBeVisible();
  await openSettingsSubmenu(page);
  await expect(item).toBeVisible();
}


export async function expectSidebarHasClientManagement(
  page: Page,
  visible: boolean,
): Promise<void> {
  const aside = page.locator('aside');
  const settings = aside.getByRole('menuitem', { name: /\bSettings\b/ });
  const clientsItem = aside.getByRole('menuitem', { name: /Client management/ });

  if (!visible) {
    if ((await settings.count()) === 0) {
      await expect(clientsItem).toHaveCount(0);
      return;
    }
    const expanded = await settings.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await settings.click();
    }
    await expect(clientsItem).toHaveCount(0);
    return;
  }

  await expect(settings).toBeVisible();
  const expanded = await settings.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await settings.click();
  }
  await expect(clientsItem).toBeVisible();
}


export async function expectSidebarHasTaskScores(page: Page, visible: boolean): Promise<void> {
  const aside = page.locator('aside');
  const item = aside.getByRole('menuitem', { name: /Task types & scores/ });

  if (!visible) {
    const hasSettings = await ensureSettingsOpen(page);
    if (!hasSettings) {
      await expect(item).toHaveCount(0);
      return;
    }
    await expect(item).toHaveCount(0);
    return;
  }

  const hasSettings = await ensureSettingsOpen(page);
  expect(hasSettings).toBe(true);
  await expect(item).toBeVisible();
}

type AuthFixtures = {
  loginAsRole: (role: SeedRole) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginAsRole: async ({ page }, use) => {
    await use(async (role) => {
      await loginAs(page, role);
    });
  },
});

export { expect };
