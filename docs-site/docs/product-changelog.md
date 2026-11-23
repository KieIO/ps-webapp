---
sidebar_position: 1
sidebar_label: Product changelog
slug: /changelog
---

# Product changelog

Trang này ghi lại các thay đổi sản phẩm đã đưa vào hệ thống.

---

## 2026-11-23

**CH Evaluate:** Chỉ **giao nguyên** sau khi CM đã giao Staff (ghi **gói CM**, không ghi ô Staff). Chặn khi còn `awaiting_cm` hoặc task cha đã chia (handoff trên split hỏi lại sau). Chi tiết: [Đánh giá task](/tasks/evaluation).

**Creative Queue (CM) — Giao Staff:** Chỉ hiện **task cha**; ẩn dòng **Task nhỏ**. Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue) · [Luồng chia task con](/split-task#4-vào-đâu-để-chia).

**List badge đánh giá:** Đổi **Đã đánh giá / CH đã đánh giá** → **Đã ĐG CH · Đã ĐG gói CM · Đã ĐG Staff**; tooltip = nhãn tab Evaluation. Chi tiết: [Đánh giá task](/tasks/evaluation#badge-trên-list-project-tasks).

**Project Tasks (Employee) — Assigned by:** List Staff đổi cột **PM Name** → **Assigned by** (người giao trực tiếp; chỉ tên clickable). Role khác giữ PM Name. Chi tiết: [Assignee & Assigned by](/tasks/assignee-display#3-list-project-tasks--role-employee).

**Đánh giá task — nhãn + Details:** Tab Evaluation / modal dùng **`Đánh giá [đối tượng] (bởi [người chấm])`**. Bỏ alert «Note from PM» trên Details. Chi tiết: [Đánh giá task](/tasks/evaluation).

**Task status — tách Đã từ chối / Hủy:** List, badge, filter dùng 5 nhóm (**Đang làm · Cần đánh giá · Đã từ chối · Hủy · Hoàn thành**). Modal/picker vẫn chỉ **Hủy** (Từ chối qua CTA). Tracker task legend: **Đang làm · Hoàn thành**. Chi tiết: [Trạng thái Task](/tasks/status#0-trạng-thái-hiển-thị-list-vs-modal).

**Creative Queue — ẩn với PM:** Role **PM** không còn thấy menu / trang **Creative Queue** (chỉ CH, CM, Admin). PM theo dõi Creative qua Project Tasks / chi tiết task. Chi tiết: [Tạo task — Ai thấy Creative Queue](/create-task#ai-thấy-creative-queue).

**Assignee / Assigned by (chi tiết Task):** Handoff khác phòng → Assignee = **tên phòng ban**, Assigned by = **PM (Project Manager)**. Trong phòng / đã giao Staff → Assignee = **tên staff**, Assigned by = người giao gần nhất. Chi tiết: [Assignee & Assigned by](/tasks/assignee-display).

**Task status:** Task đã giao Staff → **chỉ assignee** đổi trạng thái; **PM chỉ xem**. Chi tiết: [Trạng thái Task](/tasks/status).

**Client Note (Knowledge):** Thêm / sửa ghi chú client = **PM, CM, CH, Head** (+ Admin). **Xem** = mọi role mở được client / project. Chi tiết: [Ghi chú client](/clients/knowledge).

**Projects — quyền PM Edit:** PM **không** chỉnh độ khó (Volume / Nature / Time → Level). PM được sửa: ngày kết thúc, planned slides, status, mốc bàn giao, note. Chi tiết: [PM chỉnh sửa project](/projects/pm-edit).

---

## 2026-11-21

**Project Tasks:** PM chỉ thấy task thuộc project mình là PM hoặc handover PM (khớp trang Projects). Head / Creative Head / Admin vẫn thấy tất cả.
