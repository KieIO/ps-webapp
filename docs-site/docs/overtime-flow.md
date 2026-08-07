---
sidebar_position: 1
slug: /
---

# Luồng chức năng Overtime (OT)

## Tổng quan luồng OT

```text
PM tạo OT Request
      │
      ▼
Head xem xét & duyệt/từ chối
      │
      ├── Từ chối → PM nhận thông báo + lý do → Kết thúc
      │
      └── Duyệt
            │
            ▼
      PM giao task OT cho Staff
            │
            ▼
      Staff thực hiện OT
            │
            ▼
      Staff báo cáo kết quả
            │
            ▼
      PM/CM tổng hợp → báo cáo lên Head
            │
            ▼
      Hệ thống ghi nhận OT thực tế vs kế hoạch
```

## Chi tiết từng bước

### Bước 1 — PM tạo OT Request

- **Người thực hiện:** PM
- **Thông tin cần nhập:**
  - Tên project cần OT
  - Số giờ OT ước tính
  - Lý do cần OT
  - Thời gian dự kiến thực hiện
- **Gửi đến:** Head
- **Trạng thái:** `Chờ duyệt`

### Bước 2 — Head xem xét

- **Người thực hiện:** Head
- **Hành động:**
  - Xem danh sách OT request
  - Đọc thông tin: project / giờ / lý do

**Nếu duyệt:**

- Click Duyệt
- PM nhận thông báo "OT được duyệt"
- Trạng thái → `Đã duyệt`

**Nếu từ chối:**

- Nhập lý do từ chối
- PM nhận thông báo + lý do
- Trạng thái → `Từ chối`
- Luồng kết thúc

### Bước 3 — PM giao task OT

- **Người thực hiện:** PM
- **Điều kiện:** OT đã được Head duyệt
- **Thông tin giao task:**
  - Task cụ thể cần làm trong OT
  - Ai thực hiện (Staff name)
  - Khung giờ OT thực hiện
- **Gửi đến:** Staff được chỉ định

### Bước 4 — Staff thực hiện OT

- **Người thực hiện:** Employee
- **Hành động:**
  - Nhận thông báo task OT
  - Thực hiện trong khung giờ OT
  - Đánh dấu hoàn thành từng task OT
  - Ghi nhận số giờ thực tế
  - Viết ghi chú nếu có

### Bước 5 — Staff báo cáo sau OT

- **Người thực hiện:** Employee
- **Nội dung báo cáo:**
  - Task đã thực hiện là gì
  - Hoàn thành bao nhiêu
  - Số giờ OT thực tế
- **Gửi đến:** PM/CM

### Bước 6 — PM/CM tổng hợp & báo cáo

- **Người thực hiện:** PM / CM
- **Hành động:**
  - Review kết quả OT của từng Staff
  - Approve / Reject kết quả kèm lý do
  - Tổng hợp: task hoàn thành vs chưa xong
  - So sánh giờ thực tế vs kế hoạch được duyệt
  - Gửi báo cáo lên Head

### Bước 7 — Hệ thống ghi nhận

- **Người thực hiện:** System (tự động)
- **Ghi nhận:**
  - Giờ OT thực tế vs số giờ Head đã duyệt
  - Chênh lệch và lý do nếu có sai khác
  - Cập nhật OT Dashboard

## OT Dashboard & Báo cáo (Head xem)

### OT Dashboard hiển thị

- Tổng giờ OT theo người
- Tổng giờ OT theo team
- Tổng giờ OT theo kỳ (tuần/tháng)
- Cảnh báo khi OT vượt ngưỡng
- So sánh OT giữa các thành viên trong team

### Báo cáo OT định kỳ (xuất tháng/quý)

- Tổng giờ OT
- OT theo từng project
- Tỷ lệ OT được duyệt vs thực tế
