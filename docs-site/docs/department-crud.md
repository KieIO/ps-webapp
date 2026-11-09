---
sidebar_position: 1
sidebar_label: Thêm / sửa / xóa phòng ban
slug: /departments
---

# Thêm / sửa / xóa phòng ban

Hướng dẫn CRUD catalog phòng ban trên **Settings → Department management**.

Các bước liên quan: [Gắn user vào phòng ban](/departments/assign-user) · [Giới hạn phạm vi theo phòng](/departments/scope)

---

## 1. Sơ đồ tổng quan

```text
Settings → Department management
      │
      ├── Create: Name → hệ thống sinh Code
      ├── Edit: đổi Name / Description (Code giữ nguyên)
      └── Delete: chỉ khi phòng ban chưa được dùng
```

---

## 2. Ai làm được?

| Việc                                     | Ai làm được                                 |
| ---------------------------------------- | ------------------------------------------- |
| Vào **Settings → Department management** | **Admin**, **Head**, **Creative Head**      |
| Thêm / sửa / xóa phòng ban               | Cùng nhóm trên (`MANAGE_DEPARTMENTS`)       |
| Không vào trang                          | PM, Creative Manager, Employee, … → **403** |

:::note[Menu Settings]

Chỉ role có quyền mới thấy **Department management** trong sidebar Settings. Mở trực tiếp `/settings/departments` khi không có quyền → **Access denied**.

:::

---

## 3. Vào đâu?

**Settings → Department management** (`/settings/departments`)

Bảng hiện **Code**, **Name**, **Description**; nút **Create department**.

---

## 4. Tạo phòng ban

1. Bấm **Create department**.
2. Nhập **Name** (bắt buộc), ví dụ `Project`.
3. Nhập **Description** (tuỳ chọn).
4. Bấm **Create**.

Hệ thống **tự sinh Code** từ Name (chữ thường, khoảng trắng → `_`, ví dụ `Creative HCM` → `creative_hcm`). Không nhập Code trên form.

| Quy tắc                    | Kết quả                                 |
| -------------------------- | --------------------------------------- |
| Name trống                 | Lỗi: Name is required                   |
| Name trùng phòng ban đã có | Không tạo được (toast already exists)   |
| Tạo thành công             | Hiện hàng mới với Code + Name trên bảng |

---

## 5. Sửa phòng ban

1. Bấm icon **Edit** trên hàng.
2. Đổi **Name** và / hoặc **Description**.
3. Bấm **Save**.

**Code không đổi** khi sửa tên. Đổi Name thành tên đã tồn tại → bị chặn (trùng).

---

## 6. Xóa phòng ban

1. Bấm icon **Delete** → xác nhận trong popconfirm.
2. Chỉ xóa được phòng ban **chưa được dùng** (chưa gắn project / task / task group / dữ liệu liên quan).
3. Phòng ban **đang dùng** → không xóa được (toast / lỗi conflict).

:::tip[Seed mặc định]

Các phòng ban seed như **Project**, **Creative** thường đã gắn dữ liệu — thường **không** xóa được. Tạo phòng ban mới rồi xóa khi chưa dùng để thử CRUD.

:::

---

## 7. Tóm tắt

1. Admin / Head / Creative Head → Settings → Department management.
2. Create: Name (+ Description) → Code tự sinh.
3. Edit: đổi Name / Description; Code giữ nguyên.
4. Delete: chỉ khi chưa dùng.
