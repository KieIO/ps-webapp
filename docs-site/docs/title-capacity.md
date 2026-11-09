---
sidebar_position: 2
sidebar_label: Level và định mức capacity
slug: /titles/capacity
---

# Gắn Level và định mức capacity theo title

Mỗi job title gắn một **Job level** lúc tạo, và có **định mức capacity** (điểm / ngày, tỷ lệ) dùng cho workload và Tracker.

Catalog title: [Thêm / sửa / xóa chức vụ](/titles) · Gán cho user: [Đồng bộ title khi gán user](/titles/user-sync) · Chi tiết công thức: [Quản lý công thức capacity](/capacity-formula)

---

## 1. Sơ đồ tổng quan

```text
Tạo job title → chọn Job level (+ Job group)
      │
      ▼
Settings → Capacity formula
      │
      ├── Sửa Capacity / ngày theo title
      ├── Sửa tỷ lệ CM / quản lý (%)
      └── Hệ thống tính Điểm task CM
      │
      ▼
Tracker / Capacity by employee dùng định mức theo title hiện tại
```

---

## 2. Gắn Level cho title

Khi [tạo job title](/titles): chọn **Job level** (bắt buộc).

- Title thuộc đúng level đó trên catalog.
- Trên Users, Position code / Job title **chỉ hiện title cùng Level** đã chọn (hoặc title đang gắn).

Đổi level của user → phải chọn lại code / title cùng level mới — xem [Đồng bộ title khi gán user](/titles/user-sync).

---

## 3. Định mức capacity theo title

### Vào đâu?

**Settings → Capacity formula** (`/settings/employee-capacity-formula`)

Cùng danh sách job title, thêm cột capacity (inline edit).

### Các cột chính

| Cột                    | Ý nghĩa                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| **Capacity / ngày**    | Điểm capacity một ngày theo title                                        |
| **Tỷ lệ CM / quản lý** | % dùng trong công thức (taskConversionRatio)                             |
| **Điểm task CM**       | Tự tính từ Capacity / ngày × tỷ lệ — dùng làm cơ sở quy đổi trên Tracker |

Sửa **Capacity / ngày** hoặc **tỷ lệ** → blur / lưu → **Điểm task CM** cập nhật theo công thức.

:::tip[FAQ]

Cách đổi Level / Title trên user và chỗ xem capacity cá nhân vs Tracker: [FAQ đổi Level / Title](/faq). Cách dòng **Còn lại / ngày** trên Tracker dùng điểm task CM: [FAQ Còn lại / ngày](/faq).

:::

---

## 4. Ai làm được?

| Việc                               | Ai làm được                                              |
| ---------------------------------- | -------------------------------------------------------- |
| Sửa capacity trên Capacity formula | **Admin**, **Head**, **Creative Head** (`MANAGE_TITLES`) |
| Xem capacity theo employee         | Role có quyền xem Capacity                               |

---

## 5. Tóm tắt

1. Level gắn vào title lúc tạo trên Title management.
2. Định mức điểm / ngày và tỷ lệ chỉnh trên **Capacity formula** theo từng title.
3. Điểm task CM = cơ sở quy đổi slides / DA trên Tracker (team theo ngày).
