---
sidebar_position: 1
sidebar_label: Cấu hình điểm và loại điểm
slug: /task-scores
---

# Cấu hình điểm và loại điểm của task

Catalog **Task score** định nghĩa tên task, loại (task type), điểm (score), group và department — dùng khi tạo task và tính workload.

Dùng điểm: [Workload / capacity / đánh giá](/task-scores/usage)

---

## 1. Vào đâu?

**Settings → Task types & scores** (`/settings/task-score`)

Ai quản lý: **Admin**, **Head**, **Creative Head** (`MANAGE_TASK_SCORES`).

---

## 2. Sơ đồ

```text
Settings → Task score
      │
      ├── Manage groups (phân loại / màu)
      ├── Create task (name, type, score, group, department)
      └── Edit task score
```

---

## 3. Tạo / sửa task score

1. **Create task** (hoặc Edit trên hàng).
2. Điền:

| Trường         | Bắt buộc | Mô tả                                                 |
| -------------- | -------- | ----------------------------------------------------- |
| **Task name**  | Có       | Tên trong catalog (ví dụ `Slides 1`)                  |
| **Task type**  | Có       | Loại điểm / loại task (có thể gợi ý từ name)          |
| **Score**      | Có       | Điểm ≥ 0                                              |
| **Group**      | Có       | Nhóm phân loại (Manage groups)                        |
| **Department** | Không    | Phòng (Project / Creative…); gắn theo từng task score |

3. **Create** / **Save**.

Search / lọc theo group trên danh sách.

### Manage groups

- **Manage groups**: thêm / xóa group (xóa khi không còn task score dùng group đó).
- Group dùng để phân loại và màu trên bảng; department gắn trên **từng** task score, không bắt buộc trên group.

---

## 4. Tóm tắt

1. Settings → Task score → Create / Edit / Manage groups.
2. Mỗi mục: name, type, score, group (+ department).
3. Catalog này là nguồn tên / điểm khi tạo task trên hệ thống.
