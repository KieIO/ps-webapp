---
sidebar_position: 3
sidebar_label: Khối lượng theo ngày (slides, DA)
slug: /tracker/workload
---

# Xem khối lượng công việc theo ngày (slides, DA)

Ô màu trên thanh project thể hiện việc theo **ngày gắn khối lượng** — slides / DA (và loại task khác) trong ngày đó.

Đối chiếu bảng task: [Task trên project và Tracker](/project-task-views) · Capacity còn lại: [Còn lại / ngày](/tracker/remaining)

---

## 1. Ô task trên timeline

| Ưu tiên trên Tracker              | Field                    | Ghi chú                                                                       |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| **1. Deadline Creative** (nếu có) | `creativeDeadline`       | Mốc làm việc Creative — ô màu theo ngày này                                   |
| **2. Ngày task**                  | `task_date` / Start date | Khi chưa có Deadline Creative                                                 |
| **Deadline PM**                   | `deadline`               | Hạn PM trên chi tiết task — **không** đặt cột ô Tracker khi đã có Creative DL |

Project kết thúc tháng 10 nhưng task vẫn có ngày (Creative DL / ngày task) tháng 11 → Tracker tháng 11 vẫn hiện ô đó.

Click ô task → mở Project Tasks lọc project + tên task + **ngày làm việc** trùng ô.

---

## 2. Slides / DA trong ngày

- Ô thể hiện việc (ví dụ Slides, DA, QA…) theo ngày trên hàng project.
- **Mọi role:** cùng ngày + cùng tên task → **gộp một ô** với qty cộng (`39 Slides`), không tách từng task nhỏ.
- Dòng [Còn lại / ngày](/tracker/remaining) là capacity team **sau khi trừ** việc đã giao trong ngày (S / DA).

---

## 3. Checklist khi “có trên Tracker mà bảng không thấy”

1. Đang mở **đúng project**?
2. So **tháng Tracker** với **Deadline Creative** (hoặc ngày task), không chỉ Deadline PM?
3. Ô là **task con / QA**? Cần xem theo project, không phải inbox tổng.

Chi tiết: [Task trên project và Tracker](/project-task-views).

---

## 4. Tóm tắt

1. Ô màu = khối lượng theo **Deadline Creative** (nếu có), không thì **ngày task**.
2. Slides / DA trong ngày nhìn trên thanh + dòng Còn lại.
3. Đổi tháng chỉ lọc ô hiện; không đổi [tổng slides project](/tracker/total-slides).
