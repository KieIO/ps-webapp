import { test, expect } from '../fixtures/auth';
import {
  adminToken,
  fetchTrackerProjects,
  findProjectByName,
  patchProjectDates,
  resolveTrackerFixture,
} from './helpers';

/**
 * TRK-04 — Timeline bar uses VN calendar day (16/10 → block.end = 2026-10-16),
 * not UTC truncate that would stop on 15/10.
 * Unit/API: truncateToDate (Asia/Ho_Chi_Minh) in ps-be.
 */
test.describe('TRK-04 VN calendar timeline bar', () => {
  let projectId = '';
  let originalStart = '';
  let originalEnd = '';
  let originalName = '';

  test.beforeAll(async () => {
    const fixture = await resolveTrackerFixture();
    projectId = fixture.projectId;
    originalName = fixture.projectName;
    const token = await adminToken();
    const project = await findProjectByName(token, fixture.projectName);
    originalStart = project.startDate.slice(0, 10);
    originalEnd = project.endDate.slice(0, 10);
  });

  test.afterEach(async () => {
    if (!projectId || !originalStart || !originalEnd) return;
    const token = await adminToken();
    await patchProjectDates(token, projectId, {
      startDate: originalStart,
      endDate: originalEnd,
      name: originalName,
    });
  });

  test('GET /tracker project bar end matches YYYY-MM-DD VN deadline', async () => {
    const token = await adminToken();
    // Inclusive end on 16/10 — classic UTC-off-by-one case when stored near midnight VN.
    const startDate = '2026-10-01';
    const endDate = '2026-10-16';

    const patched = await patchProjectDates(token, projectId, {
      startDate,
      endDate,
      name: originalName,
    });
    expect(patched.ok).toBeTruthy();

    const projects = await fetchTrackerProjects(token);
    const row = projects.find((p) => p.id === projectId || p.name === originalName);
    expect(row, 'project present on tracker').toBeTruthy();

    const projectBar = row!.blocks.find((b) => b.start === startDate || b.end === endDate);
    expect(projectBar, 'timeline project block').toBeTruthy();
    expect(projectBar!.end).toBe(endDate);
    expect(projectBar!.start).toBe(startDate);
  });
});
