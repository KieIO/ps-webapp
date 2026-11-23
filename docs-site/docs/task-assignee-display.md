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

| Tình huống                                                                                              | Hiển thị                                                             |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Task **chia khác phòng ban** (vd. PM → Creative, đang `awaiting_ch` / `awaiting_cm` / `returned_to_pm`) | **Tên phòng ban** (vd. `Creative`) — plain text, không link Staff/CM |
| Task **chia trong phòng** hoặc đã giao Staff (`project_staff`, `assigned_staff`, …)                     | **Tên Staff** (link profile như bình thường)                         |

Áp dụng cho mọi role xem task (không còn chỉ ẩn tên với PM).

---

## 2. Assigned by

| Tình huống                             | Hiển thị                                                         |
| -------------------------------------- | ---------------------------------------------------------------- |
| Đang handoff **khác phòng** (như trên) | **PM của project/task** + role, vd. `Anh Kiệt (Project Manager)` |
| Đã giao trong phòng / đã có Staff      | Người **last handoff** (`assignedBy`), vd. CM / CH kèm role      |

`AssignedByID` trên API vẫn ghi người giao gần nhất (CH/CM); UI ưu tiên **PM** khi Assignee đang là tên phòng ban, để khớp nghiệp vụ “ai assign task sang phòng nhận”.

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

1. Khác phòng → Assignee = **phòng ban**; Assigned by = **PM (Project Manager)**.
2. Trong phòng / đã giao Staff → Assignee = **tên staff**; Assigned by = người giao gần nhất.
3. List Employee: cột **Assigned by**, không hiện PM project.
