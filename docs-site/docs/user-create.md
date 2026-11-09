---
sidebar_position: 1
sidebar_label: Tạo tài khoản user
slug: /users/create
---

# Tạo tài khoản user

Hướng dẫn mời / tạo user mới trên Pokeslide (trạng thái ban đầu **Invited**).

Tiếp theo: [Gán vị trí](/users/assign-position) · [Quản lý trạng thái](/users/status)

---

## 1. Sơ đồ

```text
Users → Invite user
      │
      ▼
Nhập name, email, role, department (+ password tuỳ chọn)
      │
      ▼
Tài khoản mới: status = Invited
(chưa gán Level / Position code / Job title)
```

---

## 2. Ai tạo được?

| Việc              | Ai làm được                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Invite / tạo user | Role có quyền quản lý users (PM, CM, CH, Head, Admin — theo `MANAGE_USERS`) |

Menu **Users** cần quyền xem danh sách user.

---

## 3. Các bước

1. Mở **Users**.
2. Bấm **Invite user** (hoặc tương đương trên UI).
3. Điền form:

| Trường         | Bắt buộc | Mô tả                                                                |
| -------------- | -------- | -------------------------------------------------------------------- |
| **Full name**  | Có       | Họ tên                                                               |
| **Email**      | Có       | Email đăng nhập (không trùng)                                        |
| **Password**   | Không    | Để trống → dùng mật khẩu mặc định hệ thống; chia sẻ an toàn cho user |
| **Role**       | Có       | Employee, PM, CM, CH, Head, Admin, …                                 |
| **Department** | Có       | Phòng ban gắn hồ sơ                                                  |

4. Bấm **Send invite**.

**Sau khi tạo:**

- Status = **Invited** (đã mời, chưa kích hoạt đầy đủ như Active)
- **Chưa** có job title — cần [gán Level / Position code / Job title](/users/assign-position) trên form chi tiết

Email trùng → không tạo được.

---

## 4. Tóm tắt

1. Users → Invite user → name, email, role, department.
2. Password tuỳ chọn (có mặc định nếu để trống).
3. User mới ở **Invited** → gán vị trí và đổi status khi sẵn sàng.
