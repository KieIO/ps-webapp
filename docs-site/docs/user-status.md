---
sidebar_position: 3
sidebar_label: Quản lý trạng thái user
slug: /users/status
---

# Quản lý trạng thái Active / On leave / Inactive / Invited

Các trạng thái hồ sơ user và cách chuyển trạng thái trên Pokeslide.

Tạo user: [Tạo tài khoản](/users/create) · On leave chi tiết: [Nghỉ phép](/leave)

---

## 1. Các trạng thái

| Status UI (form)          | Ý nghĩa                                                         |
| ------------------------- | --------------------------------------------------------------- |
| **Active**                | Đang làm việc, có thể gán task                                  |
| **On leave**              | Đang nghỉ phép; vẫn đăng nhập được nhưng **không** gán task mới |
| **Deactivate** (Inactive) | Tài khoản ngưng hoạt động                                       |
| **Invited**               | Đã mời, chưa kích hoạt                                          |

---

## 2. Ai đổi được?

| Việc                                  | Ai làm được                                     |
| ------------------------------------- | ----------------------------------------------- |
| Đổi status trên form Users            | Admin / Head / Creative Head (`canFullyManage`) |
| Đưa user sang On leave đúng quy trình | Người có quyền [lên lịch nghỉ](/leave)          |

---

## 3. Cách quản lý từng trạng thái

### Invited

- Xuất hiện sau [Invite user](/users/create).
- **Không** chuyển ngược về Invited từ Active / On leave / Inactive.
- Trên form edit: Invited chỉ hiện trong danh sách status nếu user **đang** Invited.

### Active

- Đang làm việc bình thường.
- Có thể gán task (trừ khi ngày giao thuộc kỳ nghỉ đã đặt — xem [Nghỉ phép](/leave)).

### On leave

- **Không** chọn On leave trực tiếp trên dropdown status rồi Save để “ép” nghỉ.
- Chọn On leave trên form → hệ thống mở luồng **Schedule leave** (lên lịch nghỉ), rồi trả status về giá trị cũ cho đến khi Confirm leave đúng ngày.
- On leave: vẫn **login được**; **không** giao task mới trong kỳ nghỉ.
- Hết kỳ → **tự Active**. Hủy sớm: Cancel leave.

Chi tiết: [Luồng nghỉ phép](/leave).

### Inactive (Deactivate)

- Ngưng hoạt động tài khoản (khác On leave).
- Chỉ tài khoản Deactivate mới bị chặn login theo thiết kế leave hiện tại (On leave vẫn login được).

---

## 4. Tóm tắt

1. Invited → sau khi mời; không set lại Invited từ status khác.
2. Active ↔ làm việc; On leave qua luồng nghỉ phép, không ép dropdown.
3. Inactive = Deactivate; On leave vẫn đăng nhập được.
