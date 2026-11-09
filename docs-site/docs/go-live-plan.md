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

- Xem danh sách project trên timeline
- Xem capacity còn lại theo ngày (**Còn lại / ngày**)
- Xem khối lượng công việc theo ngày (slides, DA)
- Quản lý mốc giao (milestone)
- Quản lý mức urgency (mức ưu tiên)
- Xem thông tin Sale, PM, CM trên thanh project
- Xem tổng slides phải làm của project
- Xem nhân viên đang On leave

Xem thêm: [Timeline](/tracker), [Còn lại / ngày](/tracker/remaining), [Khối lượng theo ngày](/tracker/workload), [Mốc giao](/milestone), [Urgency](/tracker/urgency), [Sale / PM / CM](/tracker/team), [Tổng slides](/tracker/total-slides), [On leave](/tracker/on-leave)

### 2. Quản lý Projects

- Tạo project mới
- Gán project cho PM
- Archive / bỏ archive project
- Quản lý mức urgency (mức ưu tiên)
- Quản lý mốc giao (milestone)
- Head đánh giá chất lượng project của PM

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

- Tạo tài khoản user
- Gán vị trí (Level, Position code, Job title)
- Quản lý trạng thái Active / On leave / Inactive / Invited

Xem thêm: [Tạo tài khoản](/users/create), [Gán vị trí](/users/assign-position), [Quản lý trạng thái](/users/status), [Nghỉ phép](/leave)

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

- Nhân viên / quản lý xin OT
- Head / Admin duyệt hoặc từ chối OT
- Gắn project task vào request OT đã duyệt
- Staff làm OT và nhập giờ thực tế
- Head / Admin review kết quả OT
- Theo dõi giờ ước tính và giờ thực tế

Xem thêm: [Xin OT](/overtime), [Duyệt / từ chối](/overtime/approve), [Gắn task](/overtime/attach-task), [Staff làm OT](/overtime/work), [Review kết quả](/overtime/review), [Theo dõi giờ](/overtime/tracking)

### 6. Cấu hình chức vụ

- Thêm / sửa / xóa chức vụ và Position code
- Gắn Level và định mức capacity theo title
- Đồng bộ title khi gán vị trí cho user

Xem thêm: [Thêm / sửa / xóa chức vụ](/titles), [Level và định mức capacity](/titles/capacity), [Đồng bộ title khi gán user](/titles/user-sync)

### 7. Quản lý phòng ban

- Thêm / sửa / xóa phòng ban
- Gắn user vào phòng ban
- Giới hạn phạm vi quản lý theo phòng

Xem thêm: [Thêm / sửa / xóa phòng ban](/departments), [Gắn user vào phòng ban](/departments/assign-user), [Giới hạn phạm vi theo phòng](/departments/scope)

### 8. Quản lý khách hàng

- Thêm / sửa / xóa khách hàng (client)
- Gắn client vào project
- Ghi chú / knowledge theo client

Xem thêm: [Thêm / sửa / xóa khách hàng](/clients), [Gắn client vào project](/clients/assign-project), [Ghi chú / knowledge](/clients/knowledge)

### 9. Quản lý công thức capacity

- Cấu hình Capacity / ngày theo title
- Cấu hình tỷ lệ CM / quản lý
- Cấu hình điểm task CM
- Quy đổi điểm sang slides / DA trên Tracker

Xem thêm: [Capacity / ngày](/capacity-formula), [Tỷ lệ CM / quản lý](/capacity-formula/ratio), [Điểm task CM](/capacity-formula/task-points), [Quy đổi trên Tracker](/capacity-formula/tracker)

### 10. Quản lý điểm của task

- Cấu hình điểm và loại điểm của task
- Dùng điểm cho workload / capacity / đánh giá

Xem thêm: [Cấu hình điểm và loại điểm](/task-scores), [Dùng điểm cho workload / capacity / đánh giá](/task-scores/usage)

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
