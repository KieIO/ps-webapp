# TASK-64 — Manual checklist: CH từ chối handoff PM

## Setup

1. Backend `seed-dev` + API `:8080`, webapp `:5173`
2. Accounts: `pm@pokeslide.dev` / `creative-head@pokeslide.dev` / `admin@pokeslide.dev` (password `ps123`)

## Happy path

1. **PM** → Project Tasks → Tạo task → workflow Project → hướng **Phòng Creative** → gửi handoff (brief có sẵn).
2. **CH** → `/creative/review` → thấy task ở `Chờ xử lý`.
3. Mở drawer / task detail → **Từ chối nhận** → confirm.
4. Expect:
   - Toast “Đã từ chối task”
   - Task **biến mất** khỏi Creative queue
   - Status sticky **Từ chối**, `pipelineStage = returned_to_pm`, department vẫn `creative`, assignee rỗng
5. **PM** → Project Tasks → search task → thấy **Từ chối**; mở detail đọc được brief cũ.
6. Notification PM: “CH đã từ chối nhận task Creative” → deep-link My Task detail (không phải Creative queue).

## Negative / permissions

| Case                                  | Expect                                   |
| ------------------------------------- | ---------------------------------------- |
| PM PATCH `decline` trên `awaiting_ch` | Forbidden / lỗi                          |
| Admin từ chối trên `awaiting_ch`      | Forbidden / không hiện CTA               |
| CM mở handoff `awaiting_ch`           | Không có CTA Từ chối nhận                |
| PM trên `awaiting_cm` (CM refuse)     | **Không** còn Từ chối nhận (đã siết)     |
| CM owning trên `awaiting_cm`          | Vẫn Từ chối nhận → về CH (`not_updated`) |

## Regression nhanh

1. Staff từ chối `assigned_staff` → vẫn về CM queue (`not_updated`).
2. CM từ chối → vẫn về CH queue.
3. Parent `split` → không từ chối parent.
4. Revision child → decline phẳng (không `returned_to_pm`).

## Automated

```bash
# BE unit + integration
cd ps-be && go test ./internal/service/ -count=1 -run 'CreativeDecline|CHRefuse|CreativeCHRefuse'
cd ps-be && go test ./internal/integration/ -count=1 -run 'TASK64'

# FE unit
cd ps-webapp && npx vitest run src/features/tasks/utils/creativePipeline.test.ts

# Playwright (API + UI; cần BE seed-dev)
cd ps-webapp && npx playwright test e2e/tasks/task-64-ch-refuse-pm-handoff.spec.ts
```
