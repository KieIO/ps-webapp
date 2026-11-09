---
sidebar_position: 6
sidebar_label: Theo dõi giờ ước tính / thực tế
slug: /overtime/tracking
---

# Theo dõi giờ ước tính và giờ thực tế

Xem danh sách OT, Dashboard, cảnh báo ngưỡng và xuất dữ liệu.

Luồng trước khi vào Dashboard: [Xin](/overtime) → [Duyệt](/overtime/approve) → [Gắn task](/overtime/attach-task) → [Staff làm](/overtime/work) → [Review](/overtime/review)

---

## 1. Vào đâu?

Menu **Overtime**: tab danh sách request và tab **Dashboard**.

Ai có quyền xin OT hoặc duyệt OT đều xem được danh sách và Dashboard.

---

## 2. Các trạng thái (để theo dõi)

| Trạng thái UI  | Khi nào                           |
| -------------- | --------------------------------- |
| **Chờ duyệt**  | Vừa tạo request                   |
| **Từ chối**    | Từ chối request xin OT            |
| **Đã duyệt**   | Đã duyệt, chưa gắn task           |
| **Đang làm**   | Đã gắn task, Staff đang làm       |
| **Chờ review** | Staff Finished + nhập giờ thực tế |
| **Hoàn thành** | Head/Admin đã duyệt kết quả       |

---

## 3. Dashboard hiển thị

- Tổng **giờ ước tính** và **giờ thực tế** theo tháng đang chọn
- Theo từng người
- Theo từng dự án
- Xu hướng theo tuần trong tháng
- Cảnh báo khi OT vượt ngưỡng tuần

---

## 4. Cảnh báo ngưỡng

- Mặc định **20 giờ ước tính / tuần** (đổi trong **Settings → Overtime alerts**)
- Chỉ để nhắc, **không chặn** tạo hay duyệt OT
- Chỉ tính request **Đã duyệt / Đang làm / Chờ review / Hoàn thành** (không tính Chờ duyệt và Từ chối)
- Gom theo nhân sự và tuần (Thứ 2 → Chủ nhật)

Đổi ngưỡng: Head, Creative Head, Admin.

---

## 5. Xuất dữ liệu

- Xuất danh sách request theo bộ lọc hiện tại (Excel/CSV)
- Dashboard có thể xuất CSV theo người trong tháng đang xem

Hiện **không** có báo cáo quý riêng hay báo cáo “tỷ lệ duyệt so với thực tế” dạng file riêng.

---

## 6. Tóm tắt

1. Overtime → danh sách + Dashboard.
2. Theo dõi giờ ước tính vs thực tế theo tháng / người / project.
3. Cảnh báo vượt ngưỡng tuần (không chặn thao tác).
