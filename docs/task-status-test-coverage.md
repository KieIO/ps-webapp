# Task status — test coverage

Rules: [Trạng thái Task](../docs-site/docs/task-status.md) (Docusaurus `/tasks/status`).

## Assignee-only (đổi status)

| Case         | Rule                                                                | Layer | Location                 |
| ------------ | ------------------------------------------------------------------- | ----- | ------------------------ |
| **TASK-14**  | Assignee cập nhật status → 200                                      | API   | `task_mgmt_test.go`      |
| **TASK-14b** | PM PATCH status khi đã giao Staff → 403 `TASK_STATUS_ASSIGNEE_ONLY` | API   | idem                     |
| Unit         | `canChangeTaskStatus` assignee / PM / Admin / cancelled             | Unit  | `taskStatusLock.test.ts` |
| Mock         | `assertAssigneeOwnsTaskStatus` trên update status / meta            | Mock  | `tasks.mock.ts`          |

## Năm nhóm UI (Đang làm / Cần đánh giá / Đã từ chối / Hủy / Hoàn thành)

| Case | Rule                                                                                                           | Layer | Location                          |
| ---- | -------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------- |
| Unit | `resolveTaskSummaryBucket` — fold not_updated+confirmed; split finished by eval; **tách** decline vs cancelled | Unit  | `taskConfirmationSummary.test.ts` |
| Unit | `bucketToStaffConfirmation` — Hủy→cancelled; declined CTA-only; needsEvaluation→finished                       | Unit  | idem                              |
| Unit | Picker omits «Cần đánh giá» + «Đã từ chối»; folds needsEvaluation → Hoàn thành                                 | Unit  | idem                              |
| Unit | `computeTaskConfirmationSummary` đếm 5 nhóm; filter contract = `resolveTaskSummaryBucket`                      | Unit  | idem                              |
| Unit | Schema `TASK_STATUS_BUCKET_FILTER_VALUES` ≡ `TASK_SUMMARY_BUCKET_ORDER`                                        | Unit  | idem                              |
| Unit | Creative Queue `statusBucket` (incl. declined/cancelled); sanitize giữ trên CM execution                       | Unit  | `creativeQueueFilters.test.ts`    |
| Unit | Tracker legend task chỉ Đang làm · Hoàn thành; `pending` cùng nhãn Đang làm                                    | Unit  | `taskConfirmation.test.ts`        |

UI wiring (list/CQ filter Trạng thái, Update status / Edit / detail chips / badge) dùng cùng helpers — không có RTL riêng; regression qua unit + manual.
