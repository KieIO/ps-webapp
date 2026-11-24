---
sidebar_position: 2
sidebar_label: Assignee & Assigned by
slug: /tasks/assignee-display
---

# Assignee & Assigned by (chi tiết Task)

Quy tắc hiển thị **Assignee** và **Assigned by** trên trang chi tiết task (và cột Assignee trên list dùng cùng helper).

Liên quan: [Tạo task](/create-task) · [Trạng thái Task](/tasks/status) · [Task trên project / Tracker](/project-task-views)

---

## 1. Assignee

| Tình huống                                                                     | Ai xem                              | Hiển thị                                                                 |
| ------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| Task **phòng Creative** (mọi stage, kể cả đã giao Staff)                       | **PM**                              | Luôn **`Creative Department`** — plain text, không lộ tên Staff Creative |
| Task **chia khác phòng** đang `awaiting_ch` / `awaiting_cm` / `returned_to_pm` | Role khác                           | **Tên phòng** (`Creative`)                                               |
| Task **Project Staff** hoặc Creative đã giao Staff                             | Role khác (CH / CM / Head / Admin…) | **Tên Staff** (link profile)                                             |

PM theo dõi gói bàn giao theo **phòng**, không theo tên từng Creative Staff trên list / chi tiết.

---

## 2. Assigned by

| Tình huống                                                      | Ai xem    | Hiển thị                                                                                     |
| --------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| Task **phòng Creative**                                         | **PM**    | Luôn **PM project** + role, vd. `Anh Kiệt (Project Manager)` — kể cả đã giao Staff / đã chia |
| Đang handoff **khác phòng** (`awaiting_ch` / `awaiting_cm` / …) | Role khác | **PM project** + role                                                                        |
| Đã giao trong phòng / đã có Staff                               | Role khác | Người **last handoff** (`assignedBy`), vd. CM / CH kèm role                                  |

`AssignedByID` trên API vẫn ghi người giao gần nhất (CH/CM); UI của **PM** luôn ưu tiên **PM project** trên task Creative (khớp Assignee = `Creative`).

UI (detail + list Employee): chỉ **tên** là link; `(Role)` plain text.

---

## 3. List Project Tasks — role Employee

Cột **Assigned by** (thay **PM Name** chỉ với Employee): người giao **trực tiếp** cho Staff — cùng helper `resolveAssignedByDisplay` / `formatAssignedByLabel` (vd. `Dev CM (Creative Manager)`).

API list `/tasks/my` trả `assignedBy` (batch enrich từ `assigned_by_id`) — cùng field với chi tiết task. Nếu cột hiện `—` thì task chưa có `assigned_by_id` trên DB (hoặc BE chưa chạy bản enrich list).

Role khác (PM, CH, CM, Head, Admin) vẫn giữ cột **PM Name** (`projectManager`).

---

## 4. Code

- Helper: `ps-webapp/src/features/tasks/utils/assigneeDisplay.ts`
- UI: `TaskDetailSummaryCard` (Assignee + Assigned by); list Employee dùng cột `assignedBy`

---

## 5. Tóm tắt

1. **PM** + task Creative → Assignee = **`Creative Department`**; Assigned by = **PM project** (kể cả đã giao Staff). Task Project vẫn hiện tên Staff.
2. Role khác: handoff chờ CH/CM → Assignee **phòng ban** / Assigned by **PM**; đã giao Staff → tên staff / last handoff.
3. List Employee: cột **Assigned by**, không hiện PM project.
