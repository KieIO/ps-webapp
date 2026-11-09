---
sidebar_position: 3
sidebar_label: Ghi chú / knowledge theo client
slug: /clients/knowledge
---

# Ghi chú / knowledge theo client

Knowledge là ghi chú dùng chung theo **client** (preference, feedback, process…), chia sẻ qua các project của khách đó.

Catalog: [Thêm / sửa / xóa khách hàng](/clients) · Gắn project: [Gắn client vào project](/clients/assign-project)

---

## 1. Sơ đồ

```text
Chi tiết client → tab Knowledge
  (hoặc panel Knowledge trên chi tiết project)
      │
      ├── Add note (title, body, category, related project tuỳ chọn)
      ├── Edit / xóa note (theo quyền)
      └── Notes dùng chung mọi project của client
```

---

## 2. Ai làm được?

| Việc                    | Ai làm được                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| Xem knowledge           | Ai mở được chi tiết client / project (theo quyền xem project / client) |
| **Add note** / sửa note | Role có quyền **EDIT_PROJECT**                                         |

Employee có thể được xem knowledge trên project tham gia (theo thiết kế quyền xem project).

---

## 3. Vào đâu?

| Chỗ                                    | Làm được gì                                      |
| -------------------------------------- | ------------------------------------------------ |
| **Client detail** → tab **Knowledge**  | Danh sách note; Add note                         |
| **Chi tiết project** → panel Knowledge | Cùng knowledge của client; có thể mở link client |

---

## 4. Mỗi note gồm gì?

| Trường              | Bắt buộc | Mô tả                                                 |
| ------------------- | -------- | ----------------------------------------------------- |
| **Body**            | Có       | Nội dung ghi chú                                      |
| **Title**           | Không    | Tiêu đề ngắn                                          |
| **Category**        | Không    | Preference, Feedback, Contact, Process, Risk, General |
| **Related project** | Không    | Gắn note với một project của client (tuỳ chọn)        |

Knowledge **theo client**, không mất khi đổi project — dùng chung để team sau không bắt đầu từ zero.

---

## 5. Tóm tắt

1. Mở client (hoặc project) → Knowledge → Add note.
2. Sửa / thêm note cần quyền edit project.
3. Note dùng chung mọi project của cùng client.
