---
sidebar_position: 2
sidebar_label: Dùng điểm cho workload / capacity / đánh giá
slug: /task-scores/usage
---

# Dùng điểm cho workload / capacity / đánh giá

Điểm trên catalog [Task score](/task-scores) được dùng khi vận hành task: chọn loại việc, tính khối lượng / workload, và gắn với capacity / đánh giá theo rule sản phẩm.

Cấu hình catalog: [Cấu hình điểm và loại điểm](/task-scores)

---

## 1. Sơ đồ

```text
Catalog Task score (name, type, score, …)
      │
      ▼
Tạo / sửa task → chọn tên task từ catalog
      │
      ├── Workload / ngày task (ô trên Tracker, capacity)
      ├── Capacity team (Còn lại / ngày trừ việc đã giao)
      └── Đánh giá / KPI theo rule sản phẩm (On-time, Quality, …)
```

---

## 2. Workload / capacity

- Khi **tạo task**, PM chọn **tên task** từ catalog Task score (kèm loại / điểm cấu hình sẵn).
- Số lượng (slides / đơn vị) × rule điểm của loại task ảnh hưởng **khối lượng** trên ngày task và trừ vào [Còn lại / ngày](/tracker/remaining) / capacity.
- Định mức title (Capacity / ngày, điểm task CM) nằm ở [công thức capacity](/capacity-formula) — khác catalog điểm **loại task**, nhưng cùng hệ thống workload.

---

## 3. Đánh giá

- Sau khi task Finished, quản lý **đánh giá** theo role (PM, CH, CM…) — xem go-live [Quản lý Task](/go-live).
- KPI / báo cáo (On-time, Quality, Output, …) lấy từ task / đánh giá trong kỳ; loại và khối lượng task (từ catalog + số lượng) là đầu vào theo rule sản phẩm hiện tại.

Chi tiết đánh giá theo luồng tạo / chia task: [Tạo task](/) · [Chia task con](/split-task).

---

## 4. Tóm tắt

1. Catalog điểm = nguồn loại / điểm khi tạo task.
2. Phục vụ workload và trừ capacity trên Tracker.
3. Gắn với đánh giá / KPI theo rule sản phẩm — không thay form Evaluate riêng.
