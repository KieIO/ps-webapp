---
sidebar_position: 3
sidebar_label: Ghi chú / knowledge theo client
slug: /clients/knowledge
---

# Ghi chú / knowledge theo client (Client Note)

Knowledge là **ghi chú client** dùng chung theo khách hàng (preference, feedback, process…), chia sẻ qua mọi project của client đó.

Catalog: [Thêm / sửa / xóa khách hàng](/clients) · Gắn project: [Gắn client vào project](/clients/assign-project)

---

## 1. Sơ đồ

```text
Chi tiết client → tab Knowledge
  (hoặc panel Knowledge trên chi tiết project)
      │
      ├── Xem notes — mọi role mở được client / project
      ├── Add note — PM, CM, CH, Head (+ Admin)
      └── Edit / xóa note — cùng quyền Add
```

---

## 2. Ai làm được?

| Việc                      | Ai làm được                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Xem** ghi chú client    | Mọi role mở được chi tiết client / project (quyền xem project — `MANAGE_PROJECTS`)                            |
| **Thêm / sửa / xóa** note | **PM**, **CM** (Creative Manager), **CH** (Creative Head), **Head** (+ Admin) — permission `EDIT_CLIENT_NOTE` |

Employee và các role khác **chỉ xem**, không Add / Edit / Delete.

---

## 3. Vào đâu?

| Chỗ                                    | Làm được gì                                      |
| -------------------------------------- | ------------------------------------------------ |
| **Client detail** → tab **Knowledge**  | Danh sách note; Add note (nếu có quyền)          |
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

## 5. Test coverage

API **CLIENT-32 / 32b–d / 39**, e2e **CLIENT-44** — xem `ps-webapp/docs/client-note-test-coverage.md`.

---

## 6. Tóm tắt

1. Mở client (hoặc project) → Knowledge.
2. **Xem:** mọi role được vào màn hình đó.
3. **Thêm / sửa:** PM, CM, CH, Head (và Admin).
4. Note dùng chung mọi project của cùng client.
