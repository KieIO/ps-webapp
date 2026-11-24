# Task status — test coverage

Rules: [Trạng thái Task](../docs-site/docs/task-status.md) (Docusaurus `/tasks/status`).

## Assignee-only (đổi status)

| Case         | Rule                                                                | Layer | Location                 |
| ------------ | ------------------------------------------------------------------- | ----- | ------------------------ |
| **TASK-14**  | Assignee cập nhật status → 200                                      | API   | `task_mgmt_test.go`      |
| **TASK-14b** | PM PATCH status khi đã giao Staff → 403 `TASK_STATUS_ASSIGNEE_ONLY` | API   | idem                     |
| Unit         | `canChangeTaskStatus` assignee / PM / Admin / cancelled             | Unit  | `taskStatusLock.test.ts` |
| Mock         | `assertAssigneeOwnsTaskStatus` trên update status / meta            | Mock  | `tasks.mock.ts`          |

## Sáu nhóm UI (Chưa xác nhận / Đang làm / Cần đánh giá / Đã từ chối / Hủy / Hoàn thành)

| Case | Rule                                                                                                                              | Layer | Location                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------- |
| Unit | `resolveTaskSummaryBucket` — not_updated→Chưa xác nhận, confirmed→Đang làm; split finished by eval; **tách** decline vs cancelled | Unit  | `taskConfirmationSummary.test.ts` |
| Unit | `bucketToStaffConfirmation` — unconfirmed→not_updated; inProgress→confirmed; Hủy→cancelled; declined CTA-only                     | Unit  | idem                              |
| Unit | Picker omits «Cần đánh giá» + «Đã từ chối»; folds needsEvaluation → Hoàn thành                                                    | Unit  | idem                              |
| Unit | `computeTaskConfirmationSummary` đếm 6 nhóm; filter contract = `resolveTaskSummaryBucket`                                         | Unit  | idem                              |
| Unit | Schema `TASK_STATUS_BUCKET_FILTER_VALUES` ≡ `TASK_SUMMARY_BUCKET_ORDER`                                                           | Unit  | idem                              |
| Unit | Creative Queue `statusBucket` (incl. unconfirmed/declined/cancelled); sanitize giữ trên CM execution                              | Unit  | `creativeQueueFilters.test.ts`    |
| Unit | Tracker legend task: Chưa xác nhận · Đang làm · Hoàn thành                                                                        | Unit  | `taskConfirmation.test.ts`        |

UI wiring (list/CQ filter Trạng thái, Update status / Edit / detail chips / badge) dùng cùng helpers — không có RTL riêng; regression qua unit + manual.
