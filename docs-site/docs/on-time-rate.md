---
sidebar_position: 2
sidebar_label: On-time rate
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

- Không có task hoàn thành trong tháng → chưa có số liệu (UI: “Chưa có task”).
- Trên hầu hết dashboard quản lý (Home Head, Productivity org/team), KPI chỉ lấy **Project Task**.

## Thế nào là “đúng hạn”?

Hệ thống so sánh **theo ngày** (không theo giờ) với field **Deadline** trên task (cột bảng / form tạo·sửa / Task detail):

```text
Ngày hoàn thành  ≤  Ngày Deadline trên task
→ Đúng hạn
```

- Cùng ngày với Deadline vẫn tính **đúng hạn**.
- Không có Deadline → task finished vẫn vào mẫu số, nhưng **không** được tính đúng hạn → làm giảm on-time rate.

## Deadline phòng Creative thì sao?

Task thuộc Creative có thể có thêm field **Deadline phòng Creative** (CH/CM nhập; staff Creative xem được).

Field này **không** tham gia tính on-time rate, **không** dùng cho Auto Urgency.

| Field trên UI               | Vai trò                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| **Deadline**                | Mốc chính. Dùng cho on-time, urgency Auto, filter đúng hạn/trễ hạn                  |
| **Deadline phòng Creative** | Mốc nội bộ phòng Creative. Theo dõi tiến độ nội bộ, **không** ảnh hưởng KPI on-time |

**Ví dụ:** Deadline chính `20/08`, Deadline phòng Creative `15/08`, staff finish ngày `18/08` → vẫn **đúng hạn** theo on-time (vì ≤ `20/08`), dù đã qua mốc Creative.

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

| Filter                             | Ý nghĩa                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| **Đúng hạn** (`on_time`)           | Finished trong tháng và ngày hoàn thành ≤ deadline         |
| **Không đúng hạn** (`not_on_time`) | Finished trong tháng nhưng trễ, hoặc không có deadline     |
| **Đã hoàn thành** (`completed`)    | Finished có `completedAt` trong tháng (không xét đúng/trễ) |

Có thể lọc trên danh sách Project Tasks (`/tasks/project`) theo timeliness + tháng hoàn thành.

## Xuất hiện ở đâu trong sản phẩm?

| Màn hình                 | Ai xem                                  | Hiển thị                                                |
| ------------------------ | --------------------------------------- | ------------------------------------------------------- |
| **Home**                 | Head / Creative Head / Admin            | Card On-time rate (org), drill-down sang task đúng hạn  |
| **Productivity**         | Head / CH / Admin (org); PM / CM (team) | Metric On-time, chart theo tuần, cột ranking            |
| **Team comparison**      | Role có quyền báo cáo                   | Cột On-time, radar, metric sort mặc định, insight       |
| **Employee performance** | Quản lý xem chi tiết NV                 | On-time rate cá nhân + tag Đúng hạn / Trễ hạn từng task |
| **Project Tasks**        | Theo quyền task                         | Filter Đúng hạn / Không đúng hạn                        |

## Alert & ngưỡng

- Ngưỡng cảnh báo thường dùng: **80%**.
- Team / insight có thể báo khi nhiều người hoặc nhóm có on-time dưới 80% trong tháng đang xem.
- Cảnh báo “sắp trễ” trên task đang mở (**deadline risk / urgency**) là khái niệm khác. **Không** tính vào on-time rate (on-time chỉ tính sau khi task đã Finished).

## Quan hệ với các chỉ số khác

| Chỉ số                            | Quan hệ                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| **Task completion**               | Chỉ Finished + `completedAt` mới vào on-time                       |
| **Deadline**                      | Field Deadline chính trên task quyết định đúng/trễ                 |
| **Deadline phòng Creative**       | Không dùng để tính on-time                                         |
| **Overtime (OT)**                 | Cùng hệ thống báo cáo nhưng **không** đổi công thức on-time        |
| **Revision / Quality / Capacity** | Metric cạnh nhau trên dashboard, tính độc lập                      |
| **Productivity ranking**          | Có cột `onTimePercent`; Team comparison mặc định sort theo On-time |

## Tóm tắt nhanh

1. Chỉ tính task **đã hoàn thành** trong tháng.
2. Đúng hạn = ngày hoàn thành ≤ ngày **Deadline** trên task.
3. **Deadline phòng Creative** không ảnh hưởng on-time.
4. Rate = đúng hạn ÷ tổng finished × 100.
5. Dashboard quản lý chủ yếu dùng **Project Task**.
6. Dưới **80%** thường được coi là cần chú ý trên alert/insight.
