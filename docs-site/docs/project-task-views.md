---
sidebar_position: 9
sidebar_label: Task trên project và Tracker
slug: /project-task-views
---

# Task trên project và Tracker

Trang này gom vài quy tắc dễ lệch khi đối chiếu **Project Tracker**, **chi tiết project**, và **Project Tasks**. Đọc để biết mỗi màn hình đang đếm / hiện gì, tránh tưởng thiếu data.

---

## 1. Hai chế độ danh sách task

| Ngữ cảnh                                                                                        | Ai thường xem              | Hiện gì                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Danh sách tổng** (Project Tasks, không chọn một project)                                      | Creative Head, Head, Admin | Chủ yếu **task cha** (gói giao Creative), **toàn org**. Task con sau khi chia nhỏ (kể cả QA) được ẩn để inbox gọn.                                                                                                                                                                                      |
| **Danh sách tổng** (Project Tasks, không chọn một project)                                      | **PM**                     | Cùng kiểu inbox task cha / revision, nhưng **chỉ project** mình là PM hoặc handover PM (khớp trang Projects).                                                                                                                                                                                           |
| **Theo một project** (chi tiết project → tab Tasks, hoặc Project Tasks đã lọc đúng tên project) | Creative Head, Head, Admin | **Task cha và task con**, kể cả QA. Khớp các ô task trên Tracker của project đó.                                                                                                                                                                                                                        |
| **Theo một project** (chi tiết project → tab Tasks)                                             | **PM**                     | **Task cha** (kể cả badge **Đã chia nhỏ**) và **revision**. **Không** hiện **Task nhỏ** (phần CM giao Staff), để PM theo dõi gói handoff. Cột **Assignee**: task Creative luôn plain text **`Creative Department`** (kể cả đã giao Staff). Chi tiết: [Assignee & Assigned by](/tasks/assignee-display). |

Staff và Creative Manager vốn đã thấy phần việc được giao cho mình (kể cả task con), không phụ thuộc bảng trên.

**Ví dụ:** Project `christmas` trên Tracker có ô **QA** và **34 Slides**. Admin / Head / Creative Head mở chi tiết project (hoặc Project Tasks lọc `christmas`) sẽ thấy các dòng task con đó (CH chỉ khi task thuộc phòng Creative). **PM** mở cùng tab Tasks chỉ thấy task cha / revision, không thấy badge **Task nhỏ**. Mở Project Tasks **không** lọc project: Head / Admin thấy task cha toàn org; **Creative Head** chỉ task phòng Creative; **PM** chỉ thấy task cha / revision trên project mình.

---

## 2. Tracker đặt ô theo Deadline Creative (nếu có), không theo Deadline PM

| Ưu tiên | Field                      | Hiện ở đâu                                                       |
| ------- | -------------------------- | ---------------------------------------------------------------- |
| **1**   | **Deadline Creative**      | Ô màu Tracker (khi task có giá trị này)                          |
| **2**   | **Ngày task** / Start date | Ô Tracker khi chưa có Creative DL                                |
| —       | **Deadline PM**            | Chi tiết / list task — không đẩy ô Tracker nếu đã có Creative DL |

Ví dụ: Deadline PM 27/11, Creative DL 25/11 → ô Tracker nằm cột **25**, không phải 27.

Khi bấm một ô task trên Tracker, hệ thống mở Project Tasks với project + tên task + **ngày làm việc** trùng ngày ô đó.

---

## 3. Cột Total trên Tracker

Cột **Total** là **tổng khối lượng toàn project** (theo quy tắc đếm trên Tracker: loại task cha đã chia nhỏ và task từ chối / hủy). Đổi tháng trên lịch **không** đổi con số này; tháng chỉ lọc ô task hiện trên timeline.

Nếu project có **Planned slides** (nhập lúc tạo / sửa project — số tổng khách cần, tuỳ chọn), cột hiện dạng `tính được/kế hoạch` (ví dụ `83/139`). Phần sau dấu `/` (planned thủ công) hiện màu khác với số tự tính để dễ phân biệt. Nếu không nhập, chỉ hiện số tự tính (ví dụ `83`).

Đối chiếu nhanh với tab Tasks (đã gồm task con khi xem theo project): tổng Qty hợp lệ trên bảng gần với phần số tự tính trên Tracker.

---

## 4. Checklist khi “Tracker có mà bảng không có”

1. Đang mở **đúng project** (chi tiết project hoặc filter Project trên Project Tasks)?
2. Đang so **tháng Tracker** với **ngày task**, không chỉ cột Deadline?
3. Ô trên Tracker là **task con / QA** không? Cần chế độ theo project (mục 1), không phải inbox tổng. Nếu đang đăng nhập **PM**, tab Tasks chi tiết project cố ý ẩn **Task nhỏ** — đối chiếu bằng Admin / Head / Creative Head hoặc mở đúng task con từ Tracker.
4. Tải lại trang hoặc đợi vài giây nếu vừa tạo hoặc vừa chia task (danh sách có thể chưa kịp cập nhật).

Nếu cả bốn bước vẫn lệch, ghi lại mã task / ngày ô / role đang đăng nhập để team kỹ thuật lần theo API.

---

## 5. Liên quan

- [Luồng chia task con](/split-task) — task con, QA, SL ngoài tổng cha
- [Mốc giao (milestone)](/milestone) — chấm trên thanh project, khác ô task theo ngày
