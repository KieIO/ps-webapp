---
sidebar_position: 1
sidebar_label: Mốc giao (milestone)
slug: /milestone
---

# Mốc giao (milestone)

Hướng dẫn này mô tả **mốc giao** trên Pokeslide: điểm deadline gắn trên thanh project Tracker (ngày giao, không phải khoảng làm việc).

:::tip[Milestone là gì?]

Mỗi mốc là một **điểm trên timeline** (ngày giao slide / DA). Cùng ngày có thể có nhiều mốc — Tracker gộp thành một chấm đỏ, badge số lượng.

:::

---

## 1. Sơ đồ tổng quan

```text
Head / Admin tạo hoặc sửa project
      │
      ▼
Thêm mốc trong form Create / Edit Project
(tên, ngày, khối lượng, đơn vị, ghi chú)
      │
      ▼
Lưu project
      │
      ▼
Tracker hiện chấm đỏ trên thanh project
      │
      ├── Ai xem được Tracker → hover / click xem thông tin
      │
      └── Head / Admin
            ├── Click thanh project → thêm mốc nhanh
            └── Click chấm đỏ → sửa / xóa
```

---

## 2. Ai làm gì?

| Việc                                      | Ai làm được                         |
| ----------------------------------------- | ----------------------------------- |
| Thêm / sửa / xóa mốc (form hoặc Tracker)  | **Department Head**, **Admin**      |
| Xem chấm đỏ và thông tin mốc trên Tracker | Ai xem được Tracker (manager-level) |
| Không CRUD mốc                            | PM, CM, Creative Head, Employee, …  |

CRUD mốc gắn role **Head / Admin** (không phụ thuộc `EDIT_PROJECT` của PM).

---

## 3. Dùng ở đâu?

| Chỗ                                   | Làm được gì                                |
| ------------------------------------- | ------------------------------------------ |
| **Create Project** / **Edit Project** | Thêm, sửa, xóa danh sách mốc trước khi lưu |
| **Project Tracker** (thanh project)   | Head/Admin: click thanh → thêm mốc nhanh   |
| **Project Tracker** (chấm đỏ)         | Hover xem; Head/Admin click → sửa / xóa    |

---

## 4. Mỗi mốc gồm gì?

| Trường        | Bắt buộc | Mô tả                          |
| ------------- | -------- | ------------------------------ |
| Tên mốc       | Có       | Ví dụ: “Batch 1”, “Giao draft” |
| Ngày deadline | Có       | Ngày giao (calendar date)      |
| Khối lượng    | Có       | Số > 0                         |
| Đơn vị        | Có       | Slides hoặc DA                 |
| Ghi chú       | Không    | Tuỳ chọn                       |

---

## 5. Rule quan trọng

- Mốc là **điểm ngày**, không kéo dài theo range làm việc của project.
- Nếu project có **total slides** (`totalSlides` > 0): tổng khối lượng các mốc đơn vị **slides** phải **≤ totalSlides**. Hệ thống chặn lưu nếu vượt.
- Cùng một ngày: nhiều mốc hợp lệ; Tracker hiển thị **một chấm** + badge số lượng.

---

## 6. Ví dụ

Project 100 slides, Head thêm:

1. Batch 1 — 01/11 — 40 slides
2. Batch 2 — 15/11 — 35 slides
3. Final — 30/11 — 25 slides

Tổng 100 ≤ 100 → lưu được. Tracker hiện 3 chấm đỏ trên thanh project đúng các ngày giao.
