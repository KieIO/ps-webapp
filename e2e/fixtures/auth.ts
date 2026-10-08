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

/** Sidebar helpers — Ant Design Menu item labels. */
export async function expectSidebarHasUsers(page: Page, visible: boolean): Promise<void> {
  const users = page.locator('aside').getByRole('menuitem', { name: /^Users$/ });
  if (visible) {
    await expect(users).toBeVisible();
  } else {
    await expect(users).toHaveCount(0);
  }
}

export async function expectSidebarHasRoles(page: Page, visible: boolean): Promise<void> {
  const aside = page.locator('aside');
  const settings = aside.getByRole('menuitem', { name: /^Settings$/ });

  if (!visible) {
    // Settings submenu may be absent entirely for PM/employee, or present without Roles.
    if ((await settings.count()) === 0) {
      await expect(aside.getByText('Roles & Permissions')).toHaveCount(0);
      return;
    }
    await settings.click();
    await expect(aside.getByText('Roles & Permissions')).toHaveCount(0);
    return;
  }

  await expect(settings).toBeVisible();
  await settings.click();
  await expect(aside.getByText('Roles & Permissions')).toBeVisible();
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
