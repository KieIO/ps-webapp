---
sidebar_position: 1
sidebar_label: Product changelog
slug: /changelog
---

# Product changelog

Trang này ghi lại các thay đổi sản phẩm đã đưa vào hệ thống.

---

## 2026-11-25

**Creative — gỡ read-path giao nguyên (sau wipe prod):** Badge/filter **Giao nguyên**, dual-eval trên parent `assigned_staff`, và `isCreativeWholeAssigned` đã gỡ. **CH** chỉ đánh giá **gói CM** trên task cha đã chia; **CM** chỉ đánh giá Staff trên task nhỏ. Admin Evaluate trên split parent không còn lớp Staff.

## 2026-11-24

**Creative Queue — bỏ giao nguyên; chỉ chia task con:** Form **Giao Staff** không còn toggle Giao nguyên / Chia nhỏ. CM luôn **chia task con** (tối thiểu **1** phần — 1 Staff nhận cả gói vẫn dùng 1 child). API `mode=whole` bị từ chối; dead write-path `assignCreativeManagerWhole` đã gỡ. **Creative Head** đánh giá **gói CM (handoff)** trên task cha đã chia. Chi tiết: [Luồng chia task con](/split-task) · [Đánh giá](/tasks/evaluation).

**Creative Queue (CH) — bỏ Deadline Creative khi giao CM:** Modal **Giao cho CM** / **Bổ sung brief & giao CM** không còn ô **Deadline Creative**. CH chỉ xem Deadline gốc; Deadline Creative do CM/Staff set ở bước sau. Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue).

**Projects — ẩn Level / Đánh giá với Nhân viên:** Role **Nhân viên** trên `/projects` không còn thấy cột **Level** và **Đánh giá**. Role khác giữ nguyên.

**Tạo task mới — urgency mặc định Low priority:** Form **Tạo task mới** (Project Tasks) chọn sẵn urgency **Low priority** (green) thay vì Auto.

**Projects — Head khóa sau Hoàn thành; PM đổi status cần lý do:** Sau khi project **Hoàn thành** (hoặc **Hủy**), **Head** không edit được nữa. **PM** vẫn edit (field allowlist) và đổi status được — khi đổi status phải nhập **Lý do thay đổi** (bắt buộc, ghi audit). Admin vẫn break-glass. Chi tiết: [PM chỉnh sửa project](/projects/pm-edit).

**Giao Staff — hiện capacity trong picker:** Các form chọn Staff (**Tạo task mới**, **Edit task**, **Assign task**, và các drawer Creative) hiện **số task đang làm + % capacity + trạng thái** giống Creative Queue _Giao task cho Staff_. Capacity theo ngày deadline (hoặc hôm nay nếu chưa có).

**Creative Queue — sửa SL task con (mọi role trừ Nhân viên):** Trong drawer **Sửa / Đổi giao**, khi đã có task con: **Admin / PM / Head / CH / CM** đều sửa được SL các phần còn mở (finished/huỷ vẫn khóa). **Nhân viên** không sửa. SL tổng vẫn chỉ người tạo hoặc Admin. Chi tiết: [FAQ câu 7](/faq#7-sửa-lại-scope-các-task-nhỏ-được-không) · [Luồng chia task con](/split-task).

**Creative Queue (CM) — Creative deadline khi thêm task con:** Trong drawer **Sửa / Đổi giao**, form **Thêm task con** có ô **Creative deadline** (giống lúc chia nhỏ lần đầu; bỏ trống = dùng deadline task cha). Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue).

**Creative Queue (CM) — lý do đổi SL task con:** Trong drawer **Sửa / Đổi giao**, khi chỉnh SL một task con khác giá trị đang lưu → hiện ô **Lý do đổi SL** ngay dưới dòng đó (bắt buộc). Đưa SL về đúng giá trị cũ → ô lý do ẩn. Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue).

**Creative Queue (CM) — drawer Sửa/Đổi giao:** Mỗi **task con** hiện badge trạng thái hoàn thành (Chưa xác nhận / Đang làm / Hoàn thành…). Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue).

**Creative Queue (CM) — Giao Staff:** Thêm cột **TT hoàn thành** + **SL hoàn thành**; pills phân loại **Tổng · Cần giao · Đã giao · Hoàn thành** (bấm/bỏ bấm để lọc). Tab gồm cả task chờ giao Staff. Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue).

**Tracker — Sales qua modal + sort A→Z:** Thêm/sửa Sales trên hàng project mở **modal** (không còn input inline). Trong modal: nhập Sales name, **Xóa Sales**, và bật/tắt **Sắp xếp Tracker theo Sales** (A→Z, lưu trên trình duyệt; project chưa có Sales ở cuối). Chi tiết: [Thông tin Sale, PM, CM](/tracker/team#2-thêm--sửa--xóa-sales).

**Project Tasks — Creative Head chỉ thấy task Creative:** Role **Creative Head** trên `/tasks/project` (và list liên quan) chỉ còn task phòng **Creative** (`department = creative` / `creative_*`) — không còn thấy task Project Staff / phòng khác. Head / Admin vẫn org-wide; PM vẫn theo project của mình.

**Project Tasks — ẩn Assign staff với Creative Head:** Role **Creative Head** không còn nút **Assign staff** trên `/tasks/project` (giao Staff là PM / CM / Head / Admin). CH giao CM qua **Creative Queue**.

**Assignee / Assigned by (PM) — task Creative:** Role **PM** trên task phòng Creative: Assignee / Staff Name = **`Creative Department`** (không hiện QUÝ NGỌC / THANH VINH…); **Assigned by** = **PM project** (vd. Anh Kiệt) — kể cả đã giao Staff / đã chia nhỏ. Task Project Staff vẫn hiện tên người. Role khác vẫn thấy tên Staff + last handoff sau khi giao. Chi tiết: [Assignee & Assigned by](/tasks/assignee-display).

**Tracker — gộp ô task mọi role:** Mọi role xem ô timeline giống Admin — cùng ngày + cùng tên → một ô qty cộng (`39 Slides`). Chi tiết: [Khối lượng theo ngày](/tracker/workload).

**Evaluate — nhập SL đạt cho gói CM / CH:** Modal **Đánh giá gói CM** (Creative Head / Head) và **Đánh giá Creative Head** (PM) dùng cùng nghiệp vụ với đánh giá Staff: nhập số lượng đạt → tự tính % hoàn thành + tóm tắt `Đạt x / y · Còn z`. Chi tiết: [Đánh giá task](/tasks/evaluation).

**Task status — bổ sung Chưa xác nhận:** List / badge / filter dùng **6 nhóm** — **Chưa xác nhận · Đang làm · Cần đánh giá · Đã từ chối · Hủy · Hoàn thành**. `not_updated` = Chưa xác nhận; Staff **Confirm** hoặc chọn **Đang làm** → `confirmed`. Picker: Chưa xác nhận · Đang làm · Hủy · Hoàn thành (Staff không thấy Hủy — từ chối qua CTA). Tracker legend task: **Chưa xác nhận · Đang làm · Hoàn thành**. Chi tiết: [Trạng thái Task](/tasks/status#0-trạng-thái-hiển-thị-list-vs-modal).

**Tracker — ô task theo Deadline Creative:** Có `creativeDeadline` → đặt ô trên ngày đó (không theo ngày task / Deadline PM). Chi tiết: [Khối lượng theo ngày](/tracker/workload).

## 2026-11-23

**CH Evaluate:** Chỉ **giao nguyên** sau khi CM đã giao Staff (ghi **gói CM**, không ghi ô Staff). Chặn khi còn `awaiting_cm` hoặc task cha đã chia (handoff trên split hỏi lại sau). Chi tiết: [Đánh giá task](/tasks/evaluation).

**Creative Queue (CM) — Giao Staff:** Chỉ hiện **task cha**; ẩn dòng **Task nhỏ**. Chi tiết: [Creative Manager: Creative queue](/create-task#creative-manager-creative-queue) · [Luồng chia task con](/split-task#4-vào-đâu-để-chia).

**List badge đánh giá:** Đổi **Đã đánh giá / CH đã đánh giá** → **Đã ĐG CH · Đã ĐG gói CM · Đã ĐG Staff**; tooltip = nhãn tab Evaluation. Chi tiết: [Đánh giá task](/tasks/evaluation#badge-trên-list-project-tasks).

**Project Tasks (Employee) — Assigned by:** List Staff đổi cột **PM Name** → **Assigned by** (người giao trực tiếp; chỉ tên clickable). Role khác giữ PM Name. Chi tiết: [Assignee & Assigned by](/tasks/assignee-display#3-list-project-tasks--role-employee).

**Đánh giá task — nhãn + Details:** Tab Evaluation / modal dùng **`Đánh giá [đối tượng] (bởi [người chấm])`**. Bỏ alert «Note from PM» trên Details. Chi tiết: [Đánh giá task](/tasks/evaluation).

**Task status — tách Đã từ chối / Hủy:** (đã bổ sung **Chưa xác nhận** ngày 24/11 — xem mục trên). Lúc này list dùng 5 nhóm (**Đang làm · Cần đánh giá · Đã từ chối · Hủy · Hoàn thành**); `not_updated` tạm gộp vào Đang làm. Chi tiết: [Trạng thái Task](/tasks/status#0-trạng-thái-hiển-thị-list-vs-modal).

**Creative Queue — ẩn với PM:** Role **PM** không còn thấy menu / trang **Creative Queue** (chỉ CH, CM, Admin). PM theo dõi Creative qua Project Tasks / chi tiết task. Chi tiết: [Tạo task — Ai thấy Creative Queue](/create-task#ai-thấy-creative-queue).

**Assignee / Assigned by (chi tiết Task):** (đã bổ sung rule PM ngày 24/11 — xem mục trên). Lúc này: handoff khác phòng → Assignee = **tên phòng ban**, Assigned by = **PM**; trong phòng / đã giao Staff → Assignee = **tên staff**, Assigned by = người giao gần nhất. Chi tiết: [Assignee & Assigned by](/tasks/assignee-display).

**Task status:** Task đã giao Staff → **chỉ assignee** đổi trạng thái; **PM chỉ xem**. Chi tiết: [Trạng thái Task](/tasks/status).

**Client Note (Knowledge):** Thêm / sửa ghi chú client = **PM, CM, CH, Head** (+ Admin). **Xem** = mọi role mở được client / project. Chi tiết: [Ghi chú client](/clients/knowledge).

**Projects — quyền PM Edit:** PM **không** chỉnh độ khó (Volume / Nature / Time → Level). PM được sửa: ngày kết thúc, planned slides, status, mốc bàn giao, note. Chi tiết: [PM chỉnh sửa project](/projects/pm-edit).

---

## 2026-11-21

**Project Tasks:** PM chỉ thấy task thuộc project mình là PM hoặc handover PM (khớp trang Projects). Head / Admin org-wide; Creative Head chỉ task phòng Creative (xem mục 2026-11-24).
