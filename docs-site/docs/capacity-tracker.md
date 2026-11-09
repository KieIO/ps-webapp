---
sidebar_position: 4
sidebar_label: Quy đổi slides / DA trên Tracker
slug: /capacity-formula/tracker
---

# Quy đổi điểm sang slides / DA trên Tracker

Dòng **Còn lại / ngày** trên Project Tracker quy đổi [điểm task CM](/capacity-formula/task-points) của team thành **Slides (S)** hoặc **DA** theo ngày.

Trang Tracker: [Còn lại / ngày](/tracker/remaining) · FAQ: [câu 5](/faq)

---

## 1. Luồng

```text
Điểm task CM từng người Active (không On leave)
      │
      ▼
Cộng team theo phòng − điểm việc đã giao trong ngày
      │
      ├── Phòng Project → ÷ 45 → Slides (chuẩn Level 3)
      └── Phòng Creative → ÷ 480 → DA (chuẩn Level 2)
      │
      ▼
Làm tròn xuống → hiện trên Tracker (S / DA)
```

---

## 2. Ý nghĩa

- Là capacity **team theo ngày**, không phải quota một người.
- Hover nhãn **Còn lại / ngày** trên Tracker để xem giả định quy đổi.
- Định mức title: **Settings → Capacity formula**.
- Cá nhân: **Capacity by employee**.

**Ví dụ:** 1 PM-5, chưa có việc → 298 ÷ 45 ≈ 6.62 → hiện **6 S**.

---

## 3. Tóm tắt

1. Team điểm task CM − việc trong ngày → ÷ 45 (S) hoặc ÷ 480 (DA).
2. Làm tròn xuống; hiện dòng Còn lại / ngày trên Tracker.
3. Đổi Capacity / tỷ lệ trên Capacity formula → ảnh hưởng quy đổi này.
