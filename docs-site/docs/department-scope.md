---
sidebar_position: 3
sidebar_label: Giới hạn phạm vi theo phòng
slug: /departments/scope
---

# Giới hạn phạm vi quản lý theo phòng

Phòng ban không chỉ là nhãn trên hồ sơ — còn dùng để **giới hạn phạm vi** một số thao tác quản lý.

Gắn phòng cho user: [Gắn user vào phòng ban](/departments/assign-user) · Catalog: [Thêm / sửa / xóa phòng ban](/departments)

---

## 1. Sơ đồ tổng quan

```text
User đã gắn Department
      │
      ▼
Thao tác quản lý (ví dụ nghỉ phép)
      │
      ├── Admin / Head → mọi nhân viên
      └── PM / CM / Creative Head → chỉ cùng phòng ban
```

---

## 2. Ví dụ: nghỉ phép

| Vai trò                             | Phạm vi lên lịch / hủy nghỉ |
| ----------------------------------- | --------------------------- |
| Admin, Head                         | Mọi nhân viên               |
| PM, Creative Manager, Creative Head | Chỉ **cùng phòng ban**      |

Chi tiết luồng nghỉ: [Nghỉ phép](/leave).

---

## 3. Các chỗ khác dùng phòng ban

- Chọn department khi tạo / sửa **project**, **task**, **task score**
- Lọc báo cáo / capacity theo department (khi màn hình có filter)

---

## 4. Tóm tắt

1. User phải được [gắn Department](/departments/assign-user) đúng.
2. PM / CM / CH chỉ thao tác quản lý (điển hình: leave) trong **cùng phòng**.
3. Admin / Head không bị giới hạn theo phòng.
