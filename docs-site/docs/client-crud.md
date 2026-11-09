---
sidebar_position: 1
sidebar_label: Thêm / sửa / xóa khách hàng
slug: /clients
---

# Thêm / sửa / xóa khách hàng (client)

Hướng dẫn CRUD catalog client trên **Settings → Client management**.

Liên quan: [Gắn client vào project](/clients/assign-project) · [Ghi chú / knowledge](/clients/knowledge)

---

## 1. Sơ đồ

```text
Settings → Client management
      │
      ├── Create client (Name)
      ├── Edit name
      └── Delete (chỉ khi chưa gắn project)
      │
      ▼
Click tên client → trang chi tiết (/clients/:id)
```

---

## 2. Ai làm được?

| Việc                                 | Ai làm được                            |
| ------------------------------------ | -------------------------------------- |
| Vào **Settings → Client management** | **Admin**, **Head**, **Creative Head** |
| Thêm / sửa / xóa client              | Cùng nhóm trên (`MANAGE_CLIENTS`)      |
| Role khác                            | Không thấy menu / **403**              |

PM **không** tạo / xóa client (FAQ Tracker: archive / Client vẫn Head / Admin).

---

## 3. Các bước

### Tạo

1. **Settings → Client management** (`/settings/clients`).
2. **Create client** → nhập **Name** (bắt buộc) → **Create**.

### Sửa

1. Icon **Edit** trên hàng → đổi Name → **Save**.

### Xóa

1. Icon **Delete** → xác nhận.
2. Chỉ xóa được client **chưa được dùng** (chưa gắn project).
3. Client đang gắn project → không xóa được.

Click **tên** client → mở chi tiết: tab Knowledge + danh sách Projects.

---

## 4. Tóm tắt

1. Admin / Head / CH → Settings → Client management.
2. CRUD theo Name; xóa chỉ khi chưa dùng.
3. Chi tiết client: knowledge + projects.
