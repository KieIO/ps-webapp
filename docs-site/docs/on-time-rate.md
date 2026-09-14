---
sidebar_position: 2
sidebar_label: On-time rate
slug: /on-time
---

# On-time rate

Chỉ số đo mức độ hoàn thành task **đúng hạn** trong một tháng, và các luồng liên quan trong sản phẩm.

## On-time rate là gì?

**On-time rate** đo mức độ hoàn thành task **đúng hạn** trong một tháng.

Nói ngắn gọn: trong số các task đã **Finished** trong tháng, bao nhiêu % hoàn thành **không trễ deadline**.

Task chưa xong **không** vào mẫu số. Chỉ tính task đã hoàn thành có ngày hoàn thành (`completedAt`).

## Công thức

```text
On-time rate (%) =
  Số task hoàn thành đúng hạn
  ÷
  Tổng task hoàn thành trong tháng
  × 100
```

- Không có task hoàn thành trong tháng → chưa có số liệu (UI: **“Chưa có task hoàn thành trong tháng”**).
- **Card KPI** trên Home Head và Productivity (org/team) chỉ lấy **Project Task**.
- **Ranking / Team comparison / alert theo người** tính on-time trên task finished của người đó **không lọc riêng Project Task** (có thể gồm non-project nếu người đó có task finished loại đó).

## Thế nào là “đúng hạn”?

Hệ thống so sánh **theo ngày** (không theo giờ) với **Deadline** hiệu lực trên task (cột bảng / form tạo·sửa / Task detail — thường map sang deadline nội bộ của task):

```text
Ngày hoàn thành  ≤  Ngày Deadline trên task
→ Đúng hạn
```

- Cùng ngày với Deadline vẫn tính **đúng hạn**.
- Không có Deadline → task finished vẫn vào mẫu số, nhưng **không** được tính đúng hạn → làm giảm on-time rate.

## Deadline Creative thì sao?

Task thuộc Creative có thể có thêm field **Deadline Creative** trên UI (CH/CM nhập; staff Creative xem được).

Field này **không** tham gia tính on-time rate, **không** dùng cho Auto Urgency.

| Field trên UI         | Vai trò                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Deadline**          | Mốc chính. Dùng cho on-time, urgency Auto, filter đúng hạn/trễ hạn                  |
| **Deadline Creative** | Mốc nội bộ phòng Creative. Theo dõi tiến độ nội bộ, **không** ảnh hưởng KPI on-time |

**Ví dụ:** Deadline chính `20/08`, Deadline Creative `15/08`, staff finish ngày `18/08` → vẫn **đúng hạn** theo on-time (vì ≤ `20/08`), dù đã qua mốc Creative.

## Luồng liên quan

```text
Staff làm task (có deadline)
      │
      ▼
Task chuyển Finished + ghi nhận completedAt
      │
      ▼
Hệ thống bucket theo tháng (theo ngày hoàn thành)
      │
      ├── Không đúng hạn / không có deadline
      │         → chỉ tăng “đã hoàn thành”
      │
      └── Đúng hạn (ngày hoàn thành ≤ deadline)
                → tăng “đúng hạn”
      │
      ▼
Tính On-time rate = đúng hạn ÷ đã hoàn thành × 100
      │
      ▼
Hiển thị trên Home / Productivity / Team comparison
      │
      └── Alert / insight nếu dưới ngưỡng (80%)
```

## Các trạng thái liên quan khi lọc task

| Filter trên UI           | Giá trị filter | Ý nghĩa                                                    |
| ------------------------ | -------------- | ---------------------------------------------------------- |
| **Đúng hạn**             | `on_time`      | Finished trong tháng và ngày hoàn thành ≤ deadline         |
| **Không đúng hạn**       | `not_on_time`  | Finished trong tháng nhưng trễ, hoặc không có deadline     |
| **Tất cả đã hoàn thành** | `completed`    | Finished có `completedAt` trong tháng (không xét đúng/trễ) |

Có thể lọc trên danh sách Project Tasks (`/tasks/project`) theo timeliness + tháng hoàn thành.

## Xuất hiện ở đâu trong sản phẩm?

| Màn hình                 | Ai xem                                                           | Hiển thị                                                             |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Home**                 | Head / Creative Head / Admin                                     | Card On-time rate (org, Project Task), drill-down sang task đúng hạn |
| **Productivity**         | Head / Creative Head / Admin (org); PM / CM (team)               | Metric On-time (Project Task), chart theo tuần, cột ranking          |
| **Team comparison**      | Role có quyền báo cáo (`EXPORT_REPORT`: PM, CM, CH, Head, Admin) | Cột On-time, radar, metric sort mặc định, insight                    |
| **Employee performance** | Quản lý xem chi tiết NV                                          | On-time rate cá nhân + tag Đúng hạn / Trễ hạn khi có ngày hoàn thành |
| **Project Tasks**        | Theo quyền task                                                  | Filter Đúng hạn / Không đúng hạn / Tất cả đã hoàn thành              |

## Alert & ngưỡng

- Ngưỡng cảnh báo thường dùng: **80%** (ví dụ đường tham chiếu trên chart Productivity).
- Team / insight có thể báo khi nhiều người hoặc nhóm có on-time dưới 80% trong tháng đang xem.
- Cảnh báo “sắp trễ” trên task đang mở (**deadline risk / urgency**) là khái niệm khác. **Không** tính vào on-time rate (on-time chỉ tính sau khi task đã Finished).

## Quan hệ với các chỉ số khác

| Chỉ số                            | Quan hệ                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| **Task completion**               | Chỉ Finished + `completedAt` mới vào on-time                       |
| **Deadline**                      | Field Deadline chính trên task quyết định đúng/trễ                 |
| **Deadline Creative**             | Không dùng để tính on-time                                         |
| **Overtime (OT)**                 | Cùng hệ thống báo cáo nhưng **không** đổi công thức on-time        |
| **Revision / Quality / Capacity** | Metric cạnh nhau trên dashboard, tính độc lập                      |
| **Productivity ranking**          | Có cột `onTimePercent`; Team comparison mặc định sort theo On-time |

## Tóm tắt nhanh

1. Chỉ tính task **đã hoàn thành** trong tháng.
2. Đúng hạn = ngày hoàn thành ≤ ngày **Deadline** trên task.
3. **Deadline Creative** không ảnh hưởng on-time.
4. Rate = đúng hạn ÷ tổng finished × 100.
5. Card KPI Home / Productivity dùng **Project Task**; ranking / Team comparison có thể gồm thêm non-project finished.
6. Dưới **80%** thường được coi là cần chú ý trên alert/insight.
