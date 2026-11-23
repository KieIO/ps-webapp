---
sidebar_position: 2
sidebar_label: Trạng thái Task
slug: /tasks/status
---

# Trạng thái Task (staff confirmation)

Ai được **cập nhật trạng thái** task trên Pokeslide. API vẫn dùng `staffConfirmation` (`not_updated` / `confirmed` / `finished` / `decline` / `cancelled`); UI gộp thành các nhóm ở mục 0.

Liên quan: [Tạo task](/create-task) · [Revision](/revision) · [OT — làm việc](/ot/work)

---

## 0. Trạng thái hiển thị (list vs modal)

**Thanh tổng hợp list** (+ badge) — 5 nhóm:

| Nhóm UI          | API / điều kiện                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **Đang làm**     | `not_updated` hoặc `confirmed`                                                             |
| **Cần đánh giá** | `finished` **chưa** đánh giá Staff/CM — **chỉ đếm / badge / filter**, không có trong modal |
| **Đã từ chối**   | `decline`                                                                                  |
| **Hủy**          | `cancelled`                                                                                |
| **Hoàn thành**   | `finished` **đã** đánh giá                                                                 |

**Modal / panel chọn status** (Update status, Edit, chips chi tiết) — **3 option**:

| Option         | Khi Save                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Đang làm**   | Ghi `confirmed`                                                                             |
| **Hủy**        | Ghi `cancelled` (Staff **không** thấy option này — từ chối qua CTA **Từ chối** → `decline`) |
| **Hoàn thành** | Ghi `finished` (chưa Evaluate vẫn vào nhóm đếm «Cần đánh giá» trên list)                    |

Filter **Trạng thái** trên Project Tasks / Creative Queue (CM execution) dùng **cùng 5 nhóm** (client-side; không gửi `statusBucket` lên API).

**Tracker** (legend task): **Đang làm** / **Hoàn thành** — `not_updated` và `confirmed` cùng màu «Đang làm» (không còn nhãn «Chưa cập nhật» trên task). Task `decline` / `cancelled` **không** hiện trên timeline. Tracker không tách «Cần đánh giá» (mọi `finished` = Hoàn thành trên bar). Legend **project** vẫn có «Chưa cập nhật» theo `project.status`.

---

## 1. Quy tắc chính

| Tình huống                           | Ai đổi status?                                           |
| ------------------------------------ | -------------------------------------------------------- |
| Task **đã giao Staff** (có assignee) | **Chỉ Staff được assign** (và Admin break-glass)         |
| Task **chưa có assignee**            | Người mở được UI status (PM tạo / quản lý…) vẫn đổi được |
| Task **Cancelled**                   | Chỉ **Admin** mở lại status                              |

**PM** (và Head / CM / CH không phải assignee): sau khi task đã giao Staff → **chỉ xem** trạng thái, không Update status / không đổi status trong form Edit.

---

## 2. UI

| Chỗ                           | Hành vi khi đã giao Staff                                                   |
| ----------------------------- | --------------------------------------------------------------------------- |
| List → nút **Update status**  | Disabled với PM; Staff assignee dùng bình thường                            |
| Chi tiết → panel / CTA status | Ẩn / khóa với PM; Staff Confirm / Finish / Decline vẫn hiện khi là assignee |
| Edit task → field Status      | Khóa với PM; hiện ghi chú chỉ Staff được giao mới sửa được                  |

Ngoại lệ Creative: **CH / CM từ chối handoff** vẫn dùng CTA Từ chối (không phải “Update status” generic của PM).

---

## 3. Test coverage

API **TASK-14 / TASK-14b**, unit `canChangeTaskStatus` + **5 nhóm UI** (`taskConfirmationSummary`) — xem `ps-webapp/docs/task-status-test-coverage.md`.

---

## 4. Tóm tắt

1. Đã giao Staff → **chỉ assignee** cập nhật trạng thái.
2. **PM chỉ view** status trên task đã giao.
3. Admin vẫn đổi được (cancel / unlock / hỗ trợ vận hành).
4. Thanh tổng hợp list: **Đang làm** / **Cần đánh giá** / **Đã từ chối** / **Hủy** / **Hoàn thành** (mục 0).
