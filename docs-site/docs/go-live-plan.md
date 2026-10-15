---
sidebar_position: 1
sidebar_label: Kế hoạch go-live
slug: /go-live
---

# Kế hoạch go-live

Phạm vi đóng gói đưa lên production theo hai phase. Phase 1 ưu tiên vận hành dự án, task, người dùng và cấu hình nền. Phase 2 gồm năng suất, báo cáo, ngôn ngữ và phân quyền trên UI.

---

## I. Go-live Phase 1 (đóng gói trước)

| #   | Hạng mục                   | Chức năng liên quan                                                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tracker dự án              | Xem danh sách project trên timeline<br />Xem capacity còn lại theo ngày (**Còn lại / ngày**)<br />Xem khối lượng công việc theo ngày (slides, DA)<br />Quản lý mốc giao (milestone)<br />Quản lý mức urgency (mức ưu tiên)<br />Xem thông tin Sale, PM, CM trên thanh project<br />Xem tổng slides phải làm của project<br />Xem nhân viên đang On leave |
| 2   | Quản lý Projects           | Tạo project mới<br />Gán project cho PM<br />Archive / bỏ archive project<br />Quản lý mức urgency (mức ưu tiên)<br />Quản lý mốc giao (milestone)<br />Head đánh giá chất lượng project của PM                                                                                                                                                          |
| 3   | Quản lý Task               | PM tạo task và giao cho phòng Project hoặc Creative<br />Creative Head nhận / từ chối task từ PM, hoặc giao cho CM<br />CM giao Staff (cả task hoặc chia nhỏ)<br />Đánh giá chất lượng theo role (PM, Creative Head, CM)<br />Sửa thông tin task sau khi đã giao                                                                                         |
| 4   | Quản lý Users              | Tạo tài khoản user<br />Gán vị trí (Level, Position code, Job title)<br />Quản lý trạng thái Active / On leave / Inactive / Invited                                                                                                                                                                                                                      |
| 5   | Quản lý OT                 | Nhân viên / quản lý xin OT<br />Head / Admin duyệt hoặc từ chối OT<br />Gắn project task vào request OT đã duyệt<br />Staff làm OT và nhập giờ thực tế<br />Head / Admin review kết quả OT<br />Theo dõi giờ ước tính và giờ thực tế                                                                                                                     |
| 6   | Cấu hình chức vụ           | Thêm / sửa / xóa chức vụ và Position code<br />Gắn Level và định mức capacity theo title<br />Đồng bộ title khi gán vị trí cho user                                                                                                                                                                                                                      |
| 7   | Quản lý phòng ban          | Thêm / sửa / xóa phòng ban<br />Gắn user vào phòng ban<br />Giới hạn phạm vi quản lý theo phòng                                                                                                                                                                                                                                                          |
| 8   | Quản lý khách hàng         | Thêm / sửa / xóa khách hàng (client)<br />Gắn client vào project<br />Ghi chú / knowledge theo client                                                                                                                                                                                                                                                    |
| 9   | Quản lý công thức capacity | Cấu hình Capacity / ngày theo title<br />Cấu hình tỷ lệ CM / quản lý<br />Cấu hình điểm task CM<br />Quy đổi điểm sang slides / DA trên Tracker                                                                                                                                                                                                          |
| 10  | Quản lý điểm của task      | Cấu hình điểm và loại điểm của task<br />Dùng điểm cho workload / capacity / đánh giá                                                                                                                                                                                                                                                                    |

Kèm theo: **thông báo / UI nhận việc** xuyên suốt các module trên:

- Nhận thông báo khi có task / project mới
- Xác nhận nhận việc hoặc từ chối theo luồng
- Creative Head / CM xem việc trên Creative queue
- Nhắc Finished / đánh giá
- Thông báo luồng OT
- Ảnh hưởng On leave khi giao việc

---

## Chi tiết Phase 1

### 1. Tracker dự án

- Danh sách projects trên timeline
- Capacity còn lại trong ngày (**Còn lại / ngày**)
- Số lượng công việc trong ngày theo project (tổng slides, tổng DA, …)
- Quản lý **mốc giao** (milestone) trên thanh project (xem; Head / Admin thêm / sửa / xóa)
- Quản lý mức **urgency** (mức ưu tiên) trên thanh project (xem; Head / Admin đổi qua chấm màu)
- Thông tin Sale, PM, CM; tổng slides phải làm
- Nhân viên **On leave** hiển thị trên tracker

Xem thêm: [Mốc giao](/milestone), [FAQ capacity trên Tracker](/faq)

### 2. Quản lý Projects

- Tạo project
- Assign project cho PM
- Archive project
- Quản lý mức urgency (mức ưu tiên) của project
- Quản lý mốc giao (milestone) trong form Create / Edit Project (Head / Admin)
- Head Project Department đánh giá chất lượng project của PM

### 3. Quản lý Task

- PM tạo task
- PM assign cho nhân viên phòng Project hoặc chuyển Creative
- Creative Head nhận task / từ chối task / giao CM
- Creative Manager giao Staff: Project task chuyển Creative / Creative task (giao nguyên hoặc chia nhỏ)
- PM đánh giá chất lượng nhân viên / Creative (Project task)
- Creative Head đánh giá Creative Manager qua task đã giao (Project task / Creative task)
- Creative Manager đánh giá Staff qua task đã giao
- Các thông tin task có thể điều chỉnh sau khi đã assign (trong giới hạn rule hiện tại)

Xem thêm: [Tạo task](/), [Chia task con](/split-task), [FAQ Decline Creative](/faq)

### 4. Quản lý Users

- Tạo user
- Assign vị trí (Level, Position code, Job title)
- Trạng thái Active / On leave / Inactive / Invited (theo luồng leave hiện có)

Xem thêm: [FAQ đổi Level / Title](/faq), [Nghỉ phép](/leave)

### Thông báo / giao diện nhận việc (xuyên suốt Phase 1)

Staff, PM, CM, Creative Head (và role liên quan) nhận việc qua **màn hình** và / hoặc **notification**:

- Nhận task / project mới được giao
- Xác nhận nhận task (confirm) hoặc từ chối theo luồng quyền
- Creative Head / CM thấy handoff trên Creative queue; Staff thấy task được giao hoặc đổi Staff
- Nhắc cập nhật trạng thái, Finished, đánh giá
- OT: thông báo xin / duyệt / từ chối / gắn task / review kết quả
- Leave / On leave: ảnh hưởng giao việc và hiển thị trên Tracker / Users

Mục tiêu: mỗi role biết có việc mới, mở đúng chỗ, đi hết vòng nhận → xác nhận → làm → kết thúc / đánh giá cơ bản.

### 5. Quản lý OT

- Xin OT (theo quyền: PM, CM, Creative Head, Head, Admin, …)
- Head / Admin duyệt hoặc từ chối
- Gắn project task sau khi duyệt
- Staff làm OT, nhập giờ thực tế, Finished
- Head / Admin review kết quả
- Theo dõi danh sách OT và giờ ước tính / thực tế

Xem thêm: [Overtime (OT)](/overtime)

### 6. Cấu hình chức vụ

- CRUD chức vụ / Position code / Job title
- Gắn Level và định mức capacity theo title
- Đồng bộ với Users khi gán vị trí

### 7. Quản lý phòng ban

- CRUD phòng ban
- Gắn user và phạm vi quản lý theo phòng (ví dụ leave, báo cáo team)

### 8. Quản lý khách hàng

- CRUD client
- Gắn client với project
- Ghi chú / knowledge client (theo quyền hiện tại)

### 9. Quản lý công thức capacity

- Cấu hình Capacity / ngày, tỷ lệ CM / quản lý, điểm task CM
- Cơ sở quy đổi slides / DA trên Tracker (**Còn lại / ngày**)

Xem thêm: [FAQ Còn lại / ngày](/faq)

### 10. Quản lý điểm của task

- Cấu hình điểm / loại điểm theo task (task scores)
- Phục vụ workload / capacity / đánh giá theo rule sản phẩm hiện tại

---

## II. Go-live Phase 2

| #   | Hạng mục           |
| --- | ------------------ |
| 1   | Quản lý năng suất  |
| 2   | Báo cáo năng suất  |
| 3   | Ngôn ngữ (i18n)    |
| 4   | Quản lý phân quyền |

**Gợi ý phạm vi Phase 2**

1. **Quản lý năng suất:** Productivity / ranking / so sánh team
2. **Báo cáo năng suất:** xuất báo cáo, drill-down KPI (On-time, Quality, Output, …) theo kỳ
3. **Ngôn ngữ:** hỗ trợ chỉnh chỉ English / Vietnamese nếu cần
4. **Phân quyền:** chỉnh ma trận quyền trên UI

---

## Tóm tắt

| Phase       | Trọng tâm                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | Tracker, Projects, Task (+ Creative), Users, thông báo nhận việc, OT, Title, Phòng ban, Client, Capacity formula, điểm task |
| **Phase 2** | Năng suất & báo cáo, i18n, phân quyền trên UI                                                                               |
