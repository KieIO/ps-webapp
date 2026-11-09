---
sidebar_position: 7
sidebar_label: Tổng slides của project
slug: /tracker/total-slides
---

# Xem tổng slides phải làm của project

Cột **Total** trên Project Tracker là tổng khối lượng slides của **cả project** (không đổi khi đổi tháng lịch).

Chi tiết đối chiếu bảng task: [Task trên project và Tracker](/project-task-views)

---

## 1. Cột Total hiện gì?

| Trường hợp                                         | Hiện                                |
| -------------------------------------------------- | ----------------------------------- |
| Chỉ có số tự tính từ task                          | Ví dụ `83`                          |
| Có **Planned slides** (nhập lúc tạo / sửa project) | `tính được/kế hoạch` ví dụ `83/139` |

- Phần trước `/`: tổng qty task loại **Slides** (không gồm DA, QA, Animation, …) theo rule đếm Tracker.
- Phần sau `/`: planned thủ công (màu khác) nếu đã nhập.

Đổi tháng trên lịch **không** đổi Total — tháng chỉ lọc ô task trên timeline.

---

## 2. Tooltip

Hover số Total: tổng qty task loại Slides (không gồm DA, QA, Animation, …).

---

## 3. Tóm tắt

1. Cột Total = tổng slides **toàn project**.
2. Có thể hiện `tính được/planned` khi có planned slides.
3. Không phụ thuộc tháng đang xem trên calendar.
