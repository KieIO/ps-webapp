---
sidebar_position: 2
sidebar_label: Task trên project và Tracker
slug: /project-task-views
---

# Task trên project và Tracker

Trang này gom vài quy tắc dễ lệch khi đối chiếu **Project Tracker**, **chi tiết project**, và **Project Tasks**. Đọc để biết mỗi màn hình đang đếm / hiện gì, tránh tưởng thiếu data.

---

## 1. Hai chế độ danh sách task

| Ngữ cảnh                                                                                        | Ai thường xem                  | Hiện gì                                                                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Danh sách tổng** (Project Tasks, không chọn một project)                                      | PM, Creative Head, Head, Admin | Chủ yếu **task cha** (gói giao Creative). Task con sau khi chia nhỏ (kể cả QA) được ẩn để inbox gọn. |
| **Theo một project** (chi tiết project → tab Tasks, hoặc Project Tasks đã lọc đúng tên project) | Cùng các role trên             | **Task cha và task con**, kể cả QA. Khớp các ô task trên Tracker của project đó.                     |

Staff và Creative Manager vốn đã thấy phần việc được giao cho mình (kể cả task con), không phụ thuộc bảng trên.

**Ví dụ:** Project `christmas` trên Tracker có ô **QA** và **34 Slides**. Mở chi tiết project (hoặc Project Tasks lọc `christmas`) sẽ thấy các dòng đó. Mở Project Tasks **không** lọc project thì Admin / PM có thể không thấy các task con đó trong inbox tổng.

---

## 2. Tracker đặt ô theo ngày task, không theo deadline

| Trường                      | Dùng để                                           | Hiện ở đâu                                 |
| --------------------------- | ------------------------------------------------- | ------------------------------------------ |
| **Ngày task** (`task date`) | Ngày làm việc / ngày gắn khối lượng trên timeline | Ô màu trên **Project Tracker** (cột ngày)  |
| **Deadline**                | Hạn hoàn thành                                    | Cột Deadline trên bảng task, chi tiết task |

Hai mốc **độc lập**. Project có thể **kết thúc** (end date) vào cuối tháng 10, trong khi một task con vẫn có **ngày task** sang tháng 11: Tracker tháng 11 vẫn hiện ô đó. Đó là đúng nghiệp vụ, không phải lỗi lệch lịch.

Khi bấm một ô task trên Tracker, hệ thống mở Project Tasks với project + tên task + **ngày làm việc** trùng ngày ô đó, để bạn đối chiếu đúng “ngày task”, không ép theo deadline.

---

## 3. Cột Total trên Tracker

Cột **Total** là **tổng khối lượng toàn project** (theo quy tắc đếm trên Tracker: loại task cha đã chia nhỏ và task từ chối / hủy). Đổi tháng trên lịch **không** đổi con số này; tháng chỉ lọc ô task hiện trên timeline.

Nếu project có **Planned slides** (nhập lúc tạo / sửa project — số tổng khách cần, tuỳ chọn), cột hiện dạng `tính được/kế hoạch` (ví dụ `83/139`). Nếu không nhập, chỉ hiện số tự tính (ví dụ `83`).

Đối chiếu nhanh với tab Tasks (đã gồm task con khi xem theo project): tổng Qty hợp lệ trên bảng gần với phần số tự tính trên Tracker.

---

## 4. Checklist khi “Tracker có mà bảng không có”

1. Đang mở **đúng project** (chi tiết project hoặc filter Project trên Project Tasks)?
2. Đang so **tháng Tracker** với **ngày task**, không chỉ cột Deadline?
3. Ô trên Tracker là **task con / QA** không? Cần chế độ theo project (mục 1), không phải inbox tổng.
4. Tải lại trang hoặc đợi vài giây nếu vừa tạo hoặc vừa chia task (danh sách có thể chưa kịp cập nhật).

Nếu cả bốn bước vẫn lệch, ghi lại mã task / ngày ô / role đang đăng nhập để team kỹ thuật lần theo API.

---

## 5. Liên quan

- [Luồng chia task con](/split-task) — task con, QA, SL ngoài tổng cha
- [Mốc giao (milestone)](/milestone) — chấm trên thanh project, khác ô task theo ngày
