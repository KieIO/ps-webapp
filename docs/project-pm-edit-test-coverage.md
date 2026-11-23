# Project PM Edit — test coverage

Rules: [PM chỉnh sửa project](../docs-site/docs/project-pm-edit.md) (Docusaurus `/projects/pm-edit`).

| Case         | Rule                                                                              | Layer | Location                                                  |
| ------------ | --------------------------------------------------------------------------------- | ----- | --------------------------------------------------------- |
| **PM-54**    | PM PATCH không đổi Volume/Nature/Time / evaluation / name; được đổi note + status | API   | `ps-be/.../project_mgmt_test.go` `TestProjectMgmt_PM54_*` |
| **PM-55**    | PM đổi endDate + plannedSlides; startDate giữ nguyên                              | API   | `TestProjectMgmt_PM55_*`                                  |
| Unit         | `applyPmProjectUpdateAllowlist` / `isPmLimitedProjectFieldEditor`                 | Unit  | `project_pm_update_test.go` · `projectEditAuth.test.ts`   |
| **PM-54 UI** | Edit modal: Volume/Nature/Time + start date disabled; end date enabled            | E2E   | `e2e/projects/pm-54-pm-edit-difficulty-locked.spec.ts`    |
| TRK-02       | PM sửa end date (timeline) — vẫn hợp lệ với allowlist                             | E2E   | `e2e/tracker/trk-02-05-pm-edit-timeline-dateonly.spec.ts` |

**Không đụng:** e2e **PM-52** = Evaluate hidden cho Employee (khác PM-54/55 API).
