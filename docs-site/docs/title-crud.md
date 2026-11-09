---
sidebar_position: 1
sidebar_label: Thêm / sửa / xóa chức vụ
slug: /titles
---

# Thêm / sửa / xóa chức vụ và Position code

Hướng dẫn quản lý catalog **Job level**, **Job group**, và **Job title** (Position code) trên **Settings → Title management**.

Liên quan: [Gắn Level và định mức capacity](/titles/capacity) · [Đồng bộ title khi gán user](/titles/user-sync)

---

## 1. Sơ đồ tổng quan

```text
Settings → Title management
      │
      ├── Tab Job titles  → tạo title (Code = Position code)
      ├── Tab Job levels  → tạo level
      └── Tab Job groups  → tạo / xóa group (chỉ khi chưa dùng)
      │
      ▼
Catalog dùng khi gán vị trí trên Users
và khi cấu hình capacity theo title
```

---

## 2. Ai làm được?

| Việc                                | Ai làm được                            |
| ----------------------------------- | -------------------------------------- |
| Vào **Settings → Title management** | **Admin**, **Head**, **Creative Head** |
| Tạo job title / level / group       | Cùng nhóm trên (`MANAGE_TITLES`)       |
| Xóa job group chưa dùng             | Cùng nhóm trên                         |
| Role khác mở `/settings/titles`     | **403** / Access denied                |

---

## 3. Vào đâu?

**Settings → Title management** (`/settings/titles`)

Ba tab: **Job titles** · **Job levels** · **Job groups**.

---

## 4. Tạo Job level

1. Tab **Job levels** → **Create job level**.
2. Nhập **Code** và **Label** (bắt buộc).
3. Bấm **Create**.

Level dùng để phân loại title và lọc Position code trên Users.

---

## 5. Tạo Job group

1. Tab **Job groups** → **Create job group**.
2. Nhập **Code** và **Label**.
3. Bấm **Create**.

Group gắn vào mỗi job title khi tạo (ví dụ nhóm Manager / Specialist).

### Xóa Job group

- Icon **Delete** trên hàng → xác nhận.
- Chỉ xóa được khi **không còn job title** nào dùng group đó.
- Còn title gắn group → không xóa được.

---

## 6. Tạo Job title (Position code)

1. Tab **Job titles** → **Create job title**.
2. Điền:

| Trường        | Bắt buộc | Mô tả                                 |
| ------------- | -------- | ------------------------------------- |
| **Code**      | Có       | Position code (ví dụ `JPE-1`, `PE-4`) |
| **Title**     | Có       | Tên chức vụ đầy đủ                    |
| **Job level** | Có       | Chọn level đã tạo                     |
| **Job group** | Có       | Chọn group đã tạo                     |

3. Bấm **Create**.

**Code** trên catalog chính là **Position code** khi gán cho user. Có thể search / lọc theo level hoặc group trên tab Job titles.

:::note[Sửa / xóa title]

Trên UI hiện tại: **tạo** title / level / group; **xóa** group khi chưa dùng. Chỉnh **định mức capacity** theo title làm ở [Capacity formula](/titles/capacity), không trên form Create job title.

:::

---

## 7. Tóm tắt

1. Admin / Head / CH → Settings → Title management.
2. Tạo level và group trước (nếu chưa có).
3. Tạo job title: Code (= Position code) + Title + Level + Group.
4. Xóa group chỉ khi không còn title gắn vào.
