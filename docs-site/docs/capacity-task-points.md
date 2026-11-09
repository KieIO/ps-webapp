---
sidebar_position: 3
sidebar_label: Điểm task CM
slug: /capacity-formula/task-points
---

# Cấu hình điểm task CM

**Điểm task CM** là điểm dùng cho workload / [Còn lại / ngày trên Tracker](/capacity-formula/tracker) — **không** nhập tay, hệ thống tính từ Capacity / ngày và tỷ lệ.

Công thức:

```text
Điểm task CM = round(Capacity / ngày × tỷ lệ CM / quản lý (%) / 100)
```

Đầu vào: [Capacity / ngày](/capacity-formula) · [Tỷ lệ CM / quản lý](/capacity-formula/ratio)

---

## 1. Hiện ở đâu?

Cột **Điểm task CM** trên **Settings → Capacity formula** (chỉ đọc — tự tính khi đổi hai cột kia).

---

## 2. Vì sao không dùng nguyên Capacity / ngày?

Tracker dùng điểm task CM để tránh case quản lý (ví dụ PM-5) hiện ~22 S thay vì ~6 S nếu lấy full capacity. Chi tiết: [FAQ Còn lại / ngày](/faq).

---

## 3. Tóm tắt

1. Điểm task CM = Capacity / ngày × tỷ lệ (làm tròn).
2. Không sửa trực tiếp cột này — sửa Capacity hoặc tỷ lệ.
3. Là đầu vào quy đổi slides / DA trên Tracker.
