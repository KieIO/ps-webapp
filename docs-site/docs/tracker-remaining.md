---
sidebar_position: 2
sidebar_label: Còn lại / ngày
slug: /tracker/remaining
---

# Xem capacity còn lại theo ngày (Còn lại / ngày)

Dòng **Còn lại / ngày** trên Project Tracker ước lượng output team còn làm được trong ngày (Slides / DA) sau khi trừ việc đã giao.

Công thức chi tiết cũng có trong [FAQ câu 5](/faq). Định mức title: [Capacity formula](/titles/capacity).

---

## 1. Ý nghĩa

- Là capacity **team theo ngày**, **không** phải quota một người.
- Hiện dưới dạng **S** (Project / slides) và **DA** (Creative) theo từng cột ngày.
- Hover nhãn **Còn lại / ngày** để xem giả định quy đổi.

---

## 2. Cách tính (tóm tắt)

**Nguồn điểm** (nhân viên **Active**, không On leave):

```text
Điểm task CM = Capacity / ngày × tỷ lệ CM / quản lý (%)
```

Mỗi ngày:

1. Cộng điểm task CM của team Active trong phòng.
2. Trừ điểm việc đã giao trong ngày.
3. Quy đổi: Project → ÷ **45** = Slides; Creative → ÷ **480** = DA.
4. **Làm tròn xuống**.

Tracker dùng **điểm task CM**, không dùng nguyên Capacity / ngày.

**Ví dụ:** 1 PM-5, chưa có việc → 298 ÷ 45 ≈ 6.62 → hiện **6 S**.

---

## 3. Tóm tắt

1. Dòng **Còn lại / ngày** = team, không phải cá nhân.
2. Dựa trên điểm task CM − việc trong ngày → slides / DA.
3. Xem cá nhân ở Capacity by employee; định mức ở Capacity formula.
