# Pokeslide — Figma Make Prompts

## SCR-016 → SCR-020: Task Assignment Flow

**Cập nhật:** 16/05/2026

---

## Hướng dẫn sử dụng

- Paste từng nhóm theo thứ tự: **Nhóm 1 → Nhóm 2 → Nhóm 3**
- Review output sau mỗi nhóm trước khi chạy tiếp
- Chạy riêng từng nhóm, không gộp

---

## Nhóm 1 — SCR-016 + SCR-017

### PM tạo task, fill brief & chọn hướng assign

```
Create 2 wireframe screens (desktop, 1440x900px) for "Pokeslide".
Same global sidebar (dark navy, "Projects" active), header. Role: "PM".
Both screens show SCR-015 task list dimmed in background with
a right-side drawer (480px, white, full height, drop shadow).

---
SCREEN 1 — SCR-016: Tạo Task & Fill Brief
Drawer header (dark navy): "Tạo Task Mới" | X close

Progress steps (horizontal, 3 steps):
[① Fill Brief ●] → [② Chọn hướng assign] → [③ Hoàn tất]
Step 1 active.

Form fields (full width each):
- "Tên task" (text input, required *)
- "Mô tả & yêu cầu" (textarea, 3 lines)
  Placeholder: "Mô tả chi tiết công việc, yêu cầu kỹ thuật..."
- "Số lượng" (number input) | "Ngày thực hiện" (date picker)
  Side by side, 50/50
- "File đính kèm / Brief" (dashed upload area)
  "Kéo thả hoặc click để upload (PDF, PNG, max 20MB)"
- "Phân loại độ khó" (3 criteria rows):
  Each row: criterion name left + buttons [1][2][3][4] right
  Row A: "Tư duy thiết kế" — [1][2✓][3][4]
  Row B: "Kỹ thuật" — [1][2][3][4] (none selected)
  Row C: "Xử lý nội dung" — [1✓][2][3][4]
  Result box (light blue bg): "Level task dự kiến: —"

Drawer footer (top border):
"Brief này sẽ đi kèm task dù assign cho phòng nào."
(small gray italic)
Button: "Tiếp theo: Chọn hướng assign →" (filled dark navy, full width)
Annotate: "→ Leads to choosing assign direction"

---
SCREEN 2 — SCR-017: Chọn Hướng Assign
Drawer header (dark navy): "Chọn Hướng Assign" | X close

Progress steps: [① Fill Brief ✓] → [② Chọn hướng ●] → [③ Hoàn tất]

Brief summary bar (light gray bg, compact, full width):
"T-031 | Level 2 | 3 slides | 14/05 | Brief: ✓ Đã fill"

Section label: "Task này sẽ được thực hiện bởi:" (bold)

Three large option cards (each 33%):

Card A: "Phòng Project Staff" (dark navy border, selected ●)
Icon: 🗂 | "Giao cho Project Staff"
Sub: "Brief đã fill sẵn đi kèm task."

Card B: "Chính mình (PM)" (gray border, unselected ○)
Icon: 👤 | "PM tự thực hiện"
Sub: "Task assign cho bạn, tự động Đang làm, không cần confirm."

Card C: "Phòng Creative" (gray border, unselected ○)
Icon: 🎨 | "Chuyển sang Creative"
Sub: "Brief đã fill sẵn — CH chỉ cần assign cho CM."
Note below card C (small orange italic):
"⚠ Nếu là Creative Task thuần, dùng luồng Creative Task
(PM không fill brief, CH sẽ fill)."

--- When Card A "Phòng Project Staff" is selected (show this state): ---

Form expands below cards:
- "Giao cho nhân viên" (dropdown, open state):
  ● Nguyễn Thảo — Free 🟢 (selectable)
  ● Trần Minh — Bình thường 🟡 (selectable)
  ○ Phạm Đức — Overloaded 🔴 (grayed, not selectable)
  ○ Lê Hương — Nghỉ phép (grayed, not selectable)
  Note: "Overloaded/nghỉ phép không thể chọn"

Auto-generated field (read-only, gray bg):
"Task Code: T-031 (tự động tạo)"

Info box (light blue):
"⏱ Nhân viên có 15 phút để confirm sau khi nhận task."

Drawer footer:
- "← Quay lại" (text link)
- "Giao task ✓" (filled dark navy)
  Annotate: "→ Notifies Project Staff (SCR-022)"
```

---

## Nhóm 2 — SCR-018 + SCR-019

### PM chuyển sang Creative & Creative Head phân công

```
Create 2 wireframe screens (desktop, 1440x900px) for "Pokeslide".
Same global sidebar (dark navy, "Projects" active), header.

---
SCREEN 1 — SCR-018: PM Chuyển Task sang Creative Department
Role badge: "PM"
Show SCR-015 dimmed in background.
Right-side drawer (480px, white, full height):

Drawer header (dark navy): "Chuyển Task sang Creative" | X close

Progress steps: [① Fill Brief ✓] → [② Assign ●] → [③ Hoàn tất]
(if Project Task transferred) OR
[① Tạo task ●] → [② Creative xử lý] (if Creative Task — no brief)

Two task type banners — show BOTH states in this screen
to illustrate the difference:

State A banner (light blue bg, full width):
"📋 Project Task — Brief có sẵn"
"Toàn bộ Creative Head sẽ nhận task và brief từ PM.
CH chỉ cần assign cho CM phù hợp."

State B banner (light yellow bg, full width, below State A):
"✏️ Creative Task — Chưa có brief"
"PM không fill brief. Creative Head sẽ fill brief
và phân loại Task Level sau khi nhận."

Task info card (light gray bg, full width):
"T-031  |  Thiết kế banner campaign Q3
Ngày: 14/05  |  Số lượng: 3 banners
Brief: ✓ Đã fill (State A) / ✗ Chưa có (State B)"

Notification info box (light teal bg):
"📣 Toàn bộ Creative Head sẽ nhận được thông báo này.
Ai trong số họ cũng có thể assign task cho CM."
Example: "Hiện có 2 Creative Head: Lê Hương & Minh Châu"

Drawer footer:
- "← Quay lại" (text link)
- "Chuyển sang Creative →" (filled dark navy)
  Annotate: "→ Notifies ALL Creative Heads (SCR-019)"

---
SCREEN 2 — SCR-019: Creative Head Nhận & Phân công Task
Role badge: "Creative Head" — Full page (no background dim).
Page title: "Task từ PM"

Notification banner (light blue, full width):
"📋 Bạn có 2 task mới từ PM — Cần xử lý và assign cho CM"

Task queue table (full width card):
Title: "Task chờ xử lý" (bold)

Columns: Task Code | Tên task | Project | PM |
Loại brief | Ngày YC | Trạng thái | Hành động

3 rows:
Row 1 (light blue bg — Project Task, brief có sẵn):
T-031 | Thiết kế banner Q3 | CRM Redesign | Nguyễn Long |
pill "✓ Có brief" (green) | 14/05 |
"Chờ assign" (yellow) | [Assign cho CM]
Annotate [Assign cho CM]: "→ CH chỉ assign, không fill brief"

Row 2 (light yellow bg — Creative Task, cần fill brief):
T-028 | Motion graphic intro | Pitch Deck | Trần Minh |
pill "✏ Cần fill brief" (orange) | 12/05 |
"Chờ xử lý" (orange) | [Fill brief & Assign]
Annotate: "→ CH fill brief + phân loại Level + assign CM"

Row 3:
T-025 | Icon set redesign | HR Portal | Phạm Đức |
pill "✓ Có brief" (green) | 10/05 |
"Đã assign" (green) | [Xem]

--- Expanded panel for Row 2 (Creative Task flow): ---
Show expanded panel below Row 2 (light yellow bg, full width):
Title: "Xử lý T-028 — Motion graphic intro"

Left column (60%) — Fill brief form:
- "Mô tả & yêu cầu chi tiết" (textarea, 3 lines, required *)
  Placeholder: "CH fill brief sau khi nhận task từ PM..."
- "Phân loại Task Level" (3 criteria):
  Tư duy thiết kế: [1][2][3✓][4]
  Kỹ thuật: [1][2✓][3][4]
  Xử lý nội dung: [1✓][2][3][4]
  Result box (light blue): "Level task: 2"
- "Ghi chú cho CM" (textarea, 2 lines, optional)

Right column (40%) — Assign to CM:
"Chọn Creative Manager" (dropdown):
○ Hoàng Yến — CM | 4 tasks | 60% 🟢
● Minh Châu — CM | 7 tasks | 85% 🔴
(Workload shown for each CM)

Panel footer:
"Hủy" (outlined) | "Fill brief & Assign cho CM →" (dark navy)
Annotate: "→ Triggers notification to CM (SCR-020)"
```

---

## Nhóm 3 — SCR-020

### Creative Manager chia & giao task cho Staff

```
Create 1 wireframe screen (desktop, 1440x900px) for "Pokeslide".
Same global sidebar (dark navy, "Projects" active), header.
Role badge: "Creative Manager". Full page layout.
Page title: "Task được giao từ Creative Head"

Task detail card (full width, light gray bg):
"T-028 — Motion graphic intro"
Project: Pitch Deck | Level: 2 | Deadline: 18/05
Từ CH: Lê Hương | Brief: "Tạo motion graphic 15 giây giới thiệu
công ty. Tone chuyên nghiệp, màu brand navy & gold."

--- Two columns (55% / 45%): ---

LEFT — "Assign cho Staff" panel:

Toggle at top:
[Giao nguyên task ○] [Chia thành task nhỏ ●]
"Chia thành task nhỏ" is selected (dark navy).

Note (light blue bg, full width):
"💡 Bạn có thể chia 1 task lớn thành nhiều task nhỏ
để assign cho nhiều Staff cùng lúc."

Task nhỏ list (3 sub-tasks shown, each collapsible row):

Sub-task 1 (expanded):
- "Tên task nhỏ": "Motion graphic — Scene 1-5" (input)
- "Giao cho": dropdown → Nguyễn Thảo (Senior) | Free 🟢
- "Số lượng": 5 scenes
- "Kỳ vọng chất lượng": ★★★☆☆

Sub-task 2 (collapsed, summary only):
"Motion graphic — Scene 6-10 | Bảo Trân | 5 scenes" [Edit]

Sub-task 3 (collapsed):
"Motion graphic — Render & export | Thu Hà | 1 file" [Edit]

Button: "+ Thêm task nhỏ" (outlined, dashed border, full width)

Footer buttons:
"Hủy" (outlined) | "Giao tất cả task nhỏ ✓" (filled dark navy)
Annotate: "→ Notifies each Staff member (SCR-022)"

--- RIGHT — "Workload team hôm nay" reference card ---
Title: "Workload team" (small bold, gray)

Mini table: Name | Role | Tasks hôm nay | Capacity
Nguyễn Thảo | Senior  | 2 tasks | 40% 🟢
Bảo Trân    | Senior  | 4 tasks | 70% 🟡
Minh Khoa   | Staff   | 6 tasks | 95% 🔴 (grayed — avoid)
Thu Hà      | Staff   | 1 task  | 25% 🟢

Gray italic note:
"Tham khảo khi quyết định chia và giao task nhỏ.
Không giao cho Overloaded 🔴."

--- Also show alternate state below (for reference): ---
Label: "Nếu chọn 'Giao nguyên task' (không chia nhỏ):"
Simplified form:
- "Giao cho" (dropdown, 1 staff)
- "Đánh giá kỳ vọng" (stars)
- Button: "Giao task ✓"
```
