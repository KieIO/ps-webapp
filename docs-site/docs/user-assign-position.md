---
sidebar_position: 2
sidebar_label: Gán vị trí (Level / Code / Title)
slug: /users/assign-position
---

# Gán vị trí (Level, Position code, Job title)

Gán chức vụ cho user trên form **Users**. Ba trường phải cùng một title trên catalog.

Tạo user: [Tạo tài khoản](/users/create) · Đồng bộ chi tiết: [Đồng bộ title khi gán user](/titles/user-sync) · Catalog: [Quản lý chức vụ](/titles)

---

## 1. Sơ đồ

```text
Users → mở hồ sơ
      │
      ├── Chọn Level
      ├── Chọn Position code  ⎫ cùng một job title
      └── Chọn Job title      ⎭
      │
      ▼
Save (Code + Title cùng Level)
```

---

## 2. Ai gán được?

| Việc                                  | Ai làm được                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| Đổi Level / Position code / Job title | Admin / Head / Creative Head (và role có quyền sửa org trên Users) |

---

## 3. Các bước

1. Mở **Users** → chọn nhân viên.
2. Chọn **Level**.
3. Chọn **Position code** hoặc **Job title** (hai ô chọn cùng một title: code ↔ tên).
4. Trước Save: Code và Title cùng level (ví dụ `PE-4` với title Level 4).
5. **Save**.

### Quy tắc đồng bộ

| Thao tác               | Hệ thống làm gì                                                |
| ---------------------- | -------------------------------------------------------------- |
| Đổi **Level**          | Title khác level mới → xóa Position code / Job title; chọn lại |
| Chọn **Position code** | Gắn title đó; Job title + Level theo title                     |
| Chọn **Job title**     | Cùng title với code; Level theo title                          |

Danh sách code / title **lọc theo Level** đang chọn.

:::warning[Hay lệch]

Đổi Level rồi Save mà không chọn lại code / title → dễ lệch hoặc trống. Luôn chọn lại cặp sau khi đổi Level.

:::

Chi tiết và FAQ: [Đồng bộ title khi gán user](/titles/user-sync), [FAQ đổi Level / Title](/faq).

---

## 4. Tóm tắt

1. Users → hồ sơ → Level + Position code + Job title cùng một title.
2. Đổi Level → chọn lại code / title rồi Save.
3. Catalog title phải có sẵn trong [Title management](/titles).
