---
sidebar_position: 3
sidebar_label: Đồng bộ title khi gán user
slug: /titles/user-sync
---

# Đồng bộ title khi gán vị trí cho user

Khi gán vị trí trên **Users**, **Level**, **Position code** và **Job title** phải đi cùng một title trên catalog — hệ thống đồng bộ / reset để tránh lệch level.

Catalog: [Thêm / sửa / xóa chức vụ](/titles) · Capacity theo title: [Level và định mức capacity](/titles/capacity)

---

## 1. Sơ đồ tổng quan

```text
Users → edit hồ sơ
      │
      ├── Chọn Level
      │     └── Title đang gắn khác level → xóa Position code / Job title
      │           → bắt buộc chọn lại code + title cùng level
      │
      └── Chọn Position code hoặc Job title
            └── Tự set Level theo title đó (hai field code/title cùng một title)
      │
      ▼
Save → Code và Title cùng level
```

---

## 2. Ai làm được?

| Việc                                  | Ai làm được                        |
| ------------------------------------- | ---------------------------------- |
| Đổi Level / Position code / Job title | Admin / Head / Creative Head (org) |
| Xem hồ sơ (read-only)                 | Theo quyền xem Users               |

---

## 3. Các bước gán đúng

1. Mở **Users** → hồ sơ nhân viên.
2. Chọn **Level** (nếu cần).
3. Chọn **Position code** hoặc **Job title** — hai ô chọn cùng một job title (code ↔ tên).
4. Trước **Save**: Code và Title cùng level (ví dụ `PE-4` với title Level 4).
5. Save.

### Quy tắc đồng bộ trên form

| Thao tác               | Hệ thống làm gì                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Đổi **Level**          | Nếu title hiện tại khác level mới → **xóa** Position code / Job title; bắt chọn lại |
| Chọn **Position code** | Gắn title đó; **Job title** và **Level** theo title                                 |
| Chọn **Job title**     | Cùng một title với Position code; Level theo title                                  |

Danh sách Position code / Job title **lọc theo Level** đang chọn (chỉ title cùng level, trừ title đang gắn nếu cần hiện lại).

---

## 4. Sau khi Save — kiểm tra

1. **Users**: Code và Job title cùng level.
2. **Capacity → Capacity by employee**: đúng title / level mới.
3. Định mức điểm / ngày: **Settings → Capacity formula** (theo title).

:::warning[Hay lệch]

Đổi Level rồi Save mà **không** chọn lại Position code / Job title → dễ còn code level cũ hoặc trống. Luôn chọn lại cặp code + title sau khi đổi Level.

:::

Chi tiết triệu chứng và verify: [FAQ đổi Level / Title](/faq). Ảnh hưởng dữ liệu kỳ trước khi đổi chức vụ: [FAQ câu 2](/faq).

---

## 5. Tóm tắt

1. Level + Position code + Job title phải cùng một title catalog.
2. Đổi Level → chọn lại code / title cùng level mới rồi Save.
3. Chọn code hoặc title → Level đồng bộ theo title đó.
