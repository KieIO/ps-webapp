---
sidebar_position: 1
sidebar_label: Xin OT
slug: /overtime
---

# Nhân viên / quản lý xin OT

Hướng dẫn tạo OT request (chưa gắn task).

Bước sau: [Duyệt / từ chối OT](/overtime/approve)

---

## 1. Sơ đồ

```text
Người có quyền xin OT tạo request
(Staff + ngày giờ OT + lý do)
      │
      ▼
Trạng thái: Chờ duyệt
(Head / Admin nhận thông báo)
```

---

## 2. Ai xin được?

| Việc                                | Ai làm được                                      |
| ----------------------------------- | ------------------------------------------------ |
| Tạo request                         | PM, Creative Manager, Creative Head, Head, Admin |
| Sửa request (chỉ khi **Chờ duyệt**) | **Người tạo** request                            |

**Người OT** luôn là **Staff (Employee) đang Active** — không chọn PM / Head / CH làm người OT.

Menu **Overtime** hiện với ai có quyền xin OT hoặc duyệt OT.

---

## 3. Vào đâu?

| Chỗ                                   | Làm được gì                |
| ------------------------------------- | -------------------------- |
| Menu **Overtime**                     | Tạo request, xem danh sách |
| **Chi tiết dự án** → section Overtime | Tạo OT sẵn chọn project đó |

---

## 4. Tạo OT request

**Cần nhập:**

- Dự án (không phải project đã archive)
- Người OT (Staff Active)
- Ngày OT
- Khung giờ bắt đầu và kết thúc (hệ thống tự tính **giờ ước tính**; tối đa 24h và không vượt khung giờ)
- Nhóm lý do (chọn ít nhất một): Late Feedbacks, Urgent, Scope of Works, Internal / Cross-department Delay, Technical Issue, Holidays, Others
- Mô tả lý do chi tiết

**Lưu ý thời gian:** nếu chọn **hôm nay**, không chọn khung giờ đã qua.

**Sau khi gửi:**

- Trạng thái: **Chờ duyệt**
- Head và Admin nhận thông báo
- **Người tạo** có thể sửa request khi còn Chờ duyệt (người khác dù có quyền xin OT cũng không sửa hộ)

Lúc này **chưa** chọn task. Task gắn [sau khi được duyệt](/overtime/attach-task).

---

## 5. Tóm tắt

1. Chọn project, Staff Active, ngày, khung giờ, lý do.
2. Gửi → **Chờ duyệt**.
3. Chỉ người tạo sửa được khi còn Chờ duyệt.
