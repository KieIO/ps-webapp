---
sidebar_position: 2
sidebar_label: Gắn user vào phòng ban
slug: /departments/assign-user
---

# Gắn user vào phòng ban

Hướng dẫn gắn / đổi phòng ban cho user trên màn hình **Users**.

Catalog phòng ban: [Thêm / sửa / xóa phòng ban](/departments) · Phạm vi sau khi gắn: [Giới hạn phạm vi theo phòng](/departments/scope)

---

## 1. Sơ đồ tổng quan

```text
Users → mở hồ sơ nhân viên
      │
      ▼
Chọn trường Department → Save
      │
      ├── Cột / filter Department trên danh sách Users
      └── Đổi department / role → có thể cần đăng nhập lại
```

---

## 2. Ai làm được?

| Việc                                | Ai làm được                               |
| ----------------------------------- | ----------------------------------------- |
| Gắn / đổi **Department** trên Users | Admin / Head / Creative Head (form Users) |
| Xem cột / filter Department         | Ai vào được danh sách Users               |

Gắn phòng ban **không** làm trên trang Department management — làm trên **Users**.

---

## 3. Các bước

1. Mở **Users** → chọn nhân viên → form chi tiết.
2. Trường **Department** (bắt buộc khi chỉnh hồ sơ quản lý).
3. Chọn phòng ban → **Save**.

Đổi department (hoặc role) có thể yêu cầu user **đăng xuất rồi đăng nhập lại** để session nhận phòng ban mới.

Trên danh sách Users có cột / filter **Department** để lọc theo phòng.

---

## 4. Lưu ý

- Cần có phòng ban trong catalog trước (Settings → Department management). Chưa có → [tạo phòng ban](/departments).
- Phòng ban trên hồ sơ ảnh hưởng **phạm vi quản lý** (ví dụ leave cùng phòng) — xem [Giới hạn phạm vi theo phòng](/departments/scope).

---

## 5. Tóm tắt

1. Users → hồ sơ nhân viên → chọn **Department** → Save.
2. Đổi phòng / role: có thể cần đăng nhập lại.
3. Lọc theo phòng trên danh sách Users khi cần.
