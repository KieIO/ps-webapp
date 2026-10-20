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
      ├── Form Create / Edit Project (PM/Head/Admin sửa timeline + mốc)
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

| Việc                                                                      | Ai làm được                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------- |
| Thêm / sửa / xóa / tick hoàn thành mốc                                    | **PM**, **Creative Manager**, **Head**, **Admin** |
| Đổi **urgency** trên Tracker (chấm ưu tiên)                               | **PM**, **Head**, **Admin**                       |
| Sửa **timeline project** (ngày bắt đầu / kết thúc) trên form Edit Project | **PM**, **Head**, **Admin**                       |
| Xem chấm và thông tin mốc trên Tracker                                    | Ai xem được Tracker                               |
| Không CRUD mốc / không đổi urgency–timeline                               | Creative Head, Employee, …                        |

:::note[PM trên Tracker]
PM có quyền tương tự Admin cho **các thao tác trên Tracker**: urgency, mốc giao, và ngày timeline project. PM **không** được tạo/xóa client hay archive project (vẫn chỉ Head/Admin).
:::

---

## 3. Dùng ở đâu?

| Chỗ                                   | Làm được gì                                                          |
| ------------------------------------- | -------------------------------------------------------------------- |
| **Create Project** / **Edit Project** | Thêm/sửa/xóa mốc; PM/Head/Admin sửa ngày bắt đầu–kết thúc (timeline) |
| **Project Tracker** (chấm urgency)    | PM/Head/Admin click để đổi mức ưu tiên                               |
| **Project Tracker** (thanh project)   | PM/CM/Head/Admin: click thanh → thêm mốc nhanh                       |
| **Project Tracker** (chấm mốc)        | Hover xem; managers click → sửa / tick hoàn thành / xóa              |

---

## 4. Mỗi mốc gồm gì?

| Trường        | Bắt buộc | Mô tả                                           |
| ------------- | -------- | ----------------------------------------------- |
| Tên mốc       | Có       | Ví dụ: “Batch 1”, “Kickoff”                     |
| Ngày deadline | Có       | Ngày giao (calendar date)                       |
| Đơn vị        | Không\*  | `slides`, `da`, hoặc trống (không khối lượng)   |
| Khối lượng    | Không\*  | Số nguyên ≥ 1 khi chọn đơn vị Slides/DA         |
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
- **Múi giờ Việt Nam (Asia/Ho_Chi_Minh):** ngày timeline project, mốc giao và thanh Tracker đều tính theo **ngày lịch VN** (không cắt theo UTC). Ví dụ deadline hiển thị **16/10** thì thanh timeline phải kéo hết cột **16/10**.
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
