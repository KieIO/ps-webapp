---
sidebar_position: 1
sidebar_label: Mốc giao
slug: /milestone
---

# Mốc giao (milestone)

Hướng dẫn này mô tả **mốc giao** trên Pokeslide: điểm deadline gắn trên thanh project Tracker (ngày giao, không phải khoảng làm việc).

:::tip[Milestone là gì?]

Mỗi mốc là một **điểm trên timeline** (ngày giao slide / DA, hoặc mốc không có khối lượng). Cùng ngày có thể có nhiều mốc — Tracker gộp thành một chấm, badge số lượng. Chấm **đỏ** = chưa hoàn thành, **xanh** = đã hoàn thành.

:::

---

## 1. Sơ đồ tổng quan

```text
PM / CM / Head / Admin tạo hoặc sửa mốc
      │
      ├── Form Create / Edit Project (Head/Admin mở form project)
      └── Tracker: click thanh project → thêm nhanh
            click chấm → sửa / tick hoàn thành / xóa
      │
      ▼
Tracker hiện chấm đỏ/xanh trên thanh project
      │
      └── Ai xem được Tracker → hover xem thông tin
```

---

## 2. Ai làm gì?

| Việc                                   | Ai làm được                                       |
| -------------------------------------- | ------------------------------------------------- |
| Thêm / sửa / xóa / tick hoàn thành mốc | **PM**, **Creative Manager**, **Head**, **Admin** |
| Xem chấm và thông tin mốc trên Tracker | Ai xem được Tracker                               |
| Không CRUD mốc                         | Creative Head, Employee, …                        |

---

## 3. Dùng ở đâu?

| Chỗ                                   | Làm được gì                                             |
| ------------------------------------- | ------------------------------------------------------- |
| **Create Project** / **Edit Project** | Thêm, sửa, xóa danh sách mốc trước khi lưu              |
| **Project Tracker** (thanh project)   | PM/CM/Head/Admin: click thanh → thêm mốc nhanh          |
| **Project Tracker** (chấm)            | Hover xem; managers click → sửa / tick hoàn thành / xóa |

---

## 4. Mỗi mốc gồm gì?

| Trường        | Bắt buộc | Mô tả                                           |
| ------------- | -------- | ----------------------------------------------- |
| Tên mốc       | Có       | Ví dụ: “Batch 1”, “Kickoff”                     |
| Ngày deadline | Có       | Ngày giao (calendar date)                       |
| Khối lượng    | Không\*  | Số > 0 khi chọn đơn vị Slides/DA                |
| Đơn vị        | Không\*  | `slides`, `da`, hoặc trống (không khối lượng)   |
| Ghi chú       | Không    | Tuỳ chọn                                        |
| Hoàn thành    | Không    | Checkbox trong form sửa; chấm Tracker đỏ → xanh |

\* Khối lượng và đơn vị đi cùng nhau: chọn Slides/DA thì bắt buộc khối lượng; để trống đơn vị thì `quantity = null`.

---

## 5. Quick view (hover)

- **Có khối lượng:** tên; `Khối lượng: …`; hạn nộp; ghi chú (nếu có).
- **Không khối lượng:** dòng chính **`Tên mốc - Ghi chú`** (chỉ tên nếu không có ghi chú); vẫn hiện hạn nộp.

---

## 6. Rule quan trọng

- Mốc là **điểm ngày**, không kéo dài theo range làm việc của project.
- Nếu project có **total slides** (`totalSlides` > 0): tổng khối lượng các mốc đơn vị **slides** phải **≤ totalSlides**. Hệ thống chặn lưu nếu vượt.
- Cùng một ngày: nhiều mốc hợp lệ; Tracker hiển thị **một chấm** + badge. Chấm xanh chỉ khi **mọi** mốc cùng ngày đều hoàn thành.
- Project archived / finish / cancel: không sửa mốc.

---

## 7. Ví dụ

Project 100 slides, PM thêm:

1. Kickoff — 01/11 — (không khối lượng) — “Họp nội bộ”
2. Batch 1 — 10/11 — 40 slides
3. Batch 2 — 20/11 — 60 slides

Tổng slides 100 ≤ 100 → lưu được. Tracker hiện chấm đỏ; tick “Hoàn thành” trên mốc → chấm xanh.
