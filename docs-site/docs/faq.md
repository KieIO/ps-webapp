---
sidebar_position: 1
sidebar_label: FAQ
slug: /faq
---

# FAQ

Câu hỏi thường gặp khi dùng PokeSlide. Nội dung ngắn, đủ để tra cứu và dùng làm product knowledge.

---

## 1. Đổi Level / Position code rồi mà Job title hoặc capacity không đổi?

**Triệu chứng thường gặp**

1. Đổi Level hoặc Position code, Save xong danh sách Users vẫn lệch: Code đã Level 4 nhưng Job title còn Level 1.
2. Capacity cá nhân không tăng theo title mới.
3. Nhìn dòng **S** trên Tracker rồi kết luận sai capacity của từng người.

**Cách làm đúng khi sửa user**

1. Mở edit user.
2. Đổi **Level** nếu cần. Khi đổi Level, **Position code** bị reset.
3. Chọn lại **Position code** hoặc **Job title** cho khớp Level mới (hai field này luôn đi cặp).
4. Kiểm tra trước khi Save: Code và Title cùng một level (ví dụ PE-4 với Job title Level 4).
5. Save.

Nếu Code và Title không khớp, capacity theo title sẽ không đúng như mong đợi.

**Verify sau khi Save**

1. **Users**: Code và Job title cùng level.
2. **Capacity → Capacity by employee**: row user hiện đúng title / level mới.
3. Muốn xem định mức gốc (điểm / ngày): **Settings → Capacity formula**.
4. **Tracker**: refresh để thấy capacity team. Dòng **S** là capacity còn lại của **team theo ngày**, không phải “một người = 14 slides/ngày”. Không dùng Tracker để confirm capacity cá nhân.

**Ví dụ định mức (tham chiếu công thức)**

| Title | Điểm / ngày (khoảng) | Quy ra slides trên Tracker (điểm ÷ 45) |
| ----- | -------------------- | -------------------------------------- |
| PE-1  | ~480                 | ~10 slides                             |
| PE-4  | ~633                 | ~14 slides                             |

Số trên Settings có thể chỉnh theo công thức thực tế của hệ thống. Bảng trên chỉ giúp hiểu quan hệ điểm và slides.

**Tóm lại**

Đổi Level xong phải chọn lại Position code / Job title cho khớp, rồi Save. Xem capacity cá nhân ở **Capacity by employee**. Xem định mức ở **Capacity formula**. Tracker chỉ phản ánh capacity team còn lại theo ngày.

---

## 2. Đổi chức vụ rồi, dữ liệu kỳ trước có giữ nguyên không?

Sau ngày hiệu lực của chức vụ mới, **không phải mọi thứ đều “khóa” theo title cũ**. Tùy loại dữ liệu.

**Giữ nguyên (không bị sửa vì đổi title)**

| Loại                                                   | Giải thích ngắn                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Task và lịch sử làm việc                               | Task gắn theo người, không gắn theo chức vụ lúc làm. Đổi title không làm mất hay chuyển task kỳ trước. |
| KPI theo tháng (On-time, Quality, Revision, Output, …) | Tính từ task và đánh giá trong tháng đó. Đổi title sau này **không** tính lại KPI tháng đã qua.        |

**Ví dụ:** Tháng 9 Thi là Junior, xong 12 task, on-time 90%, quality 4.2. Ngày 15/10 lên Senior. Mở lại tháng 9 vẫn thấy 12 task, 90% và 4.2. Không bị tính lại theo chuẩn Senior.

**Bị tính lại theo title hiện tại**

| Loại                                       | Giải thích ngắn                                                                                                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capacity %, target output, ranking theo kỳ | Hệ thống **không** lưu title theo từng tháng để tính lại. Khi xem tháng cũ vẫn lấy **Capacity / ngày của title hiện tại**. Cùng khối lượng làm tháng cũ, % capacity có thể khác số lúc còn title cũ. |

**Ví dụ:** Tháng 9 Thi Junior, capacity ~80%. Sau lên Senior (capacity / ngày cao hơn), mở lại tháng 9 có thể thấy ~50% dù lượng task tháng 9 không đổi.

**Chức danh trên profile và màn Capacity**

Luôn hiện **title hiện tại**. Hệ thống chưa lưu lịch sử title theo kỳ. Mở tháng cũ vẫn thấy title mới nếu đã đổi.

**Ví dụ:** 15/10 lên Senior. Vào profile hoặc Capacity xem tháng 9 vẫn hiện Senior, không hiện Junior.

**Tóm lại**

Task và KPI tháng cũ giữ nguyên. Capacity %, target, ranking khi xem lại tháng cũ theo **title hiện tại**. Cột chức danh trên UI cũng luôn là title hiện tại.

---

## 3. Nghỉ phép nhiều đợt rời nhau thì làm sao?

Ví dụ cần nghỉ 30/09→16/10, rồi 26/10, 20/11, rồi 10/12→20/12. **Mỗi khoảng liên tục phải Schedule leave một lần.** Không gộp các ngày rời thành một kỳ.

**Cách lên lịch**

1. **Users** → chọn nhân viên **Active** → **Leave**, hoặc **User detail** → **Schedule leave**.
2. Chọn ngày bắt đầu / kết thúc (một khoảng liền), lý do tuỳ chọn.
3. Xem task trong kỳ → chọn người thay hoặc để trống.
4. **Confirm leave**.

Muốn thêm đợt khác: Schedule lại khoảng mới (không chồng ngày đã book). Wizard hiện **Already booked** và khoá ngày đã chiếm.

**Quy tắc cần nhớ**

1. Mỗi lần Confirm = **một khoảng liên tục** (từ ngày A đến ngày B).
2. Có thể đặt **nhiều kỳ**, miễn **không chồng lịch**.
3. Nghỉ **tương lai**: Confirm xong nhân viên **vẫn Active** đến ngày bắt đầu, rồi mới **On leave**.
4. Kỳ **cover hôm nay**: Confirm xong → **On leave** ngay.
5. Trong lúc **On leave**: **không** giao task mới cho người đó.
6. Hết kỳ đúng hạn: **không** tự về Active. **Chỉ Admin** bấm **Activate employee**. Nếu không Activate, vẫn On leave (kể cả khi còn kỳ tương lai đã lên lịch).
7. Đi làm sớm hơn ngày kết thúc đã đặt: **Cancel leave** từng kỳ (người có quyền lên lịch), về Active ngay nếu đang On leave vì kỳ đó.

**Luồng ngắn**

```text
Active
  → Schedule leave + Confirm
  → (tới ngày) On leave
  → hết kỳ
  → vẫn On leave
  → Admin Activate
  → Active
```

Chi tiết đầy đủ: [Luồng nghỉ phép](/leave).

**Tóm lại**

Ngày nghỉ rời nhau → Schedule từng khoảng. Nhiều kỳ được, không chồng. Hết nghỉ phải Admin Activate mới về Active và nhận task lại.

---

## 4. Dòng “Còn lại / ngày” trên Project Tracker tính thế nào?

Đó là ước lượng **output còn lại của cả team theo ngày** (Slides hoặc DA), sau khi trừ workload đã giao. **Không** phải quota cá nhân của một người.

**Nguồn điểm**

Hệ thống lấy **điểm task CM** của mọi nhân viên đang **Active** (không On leave), theo title trong Settings.

```text
Điểm task CM = Capacity / ngày × tỷ lệ CM / quản lý (%)
```

1. **PM, Creative Manager:** dùng tỷ lệ theo title (ví dụ PM-5: Capacity / ngày 994, tỷ lệ 30% → điểm task CM = 298).
2. **Staff thường:** tỷ lệ 100% → điểm task CM = Capacity / ngày.

Trước đây Tracker từng lấy nhầm **Capacity / ngày** (PM-5 ra ~22 S). Hiện lấy **điểm task CM** (PM-5 ra ~6 S).

**Cách quy ra Slides / DA mỗi ngày**

1. Cộng điểm task CM của team Active trong phòng.
2. Trừ điểm workload đã giao trong ngày đó.
3. Quy đổi phần còn lại:
   - Phòng **Project:** điểm còn lại ÷ **45** → số **Slides** (chuẩn Level 3).
   - Phòng **Creative:** điểm còn lại ÷ **480** → số **DA** (chuẩn Level 2).
4. Kết quả **làm tròn xuống** (floor).

**Ví dụ:** Chỉ 1 PM-5 Active, chưa có workload → 298 ÷ 45 ≈ 6.62 → Tracker hiện **6 S**.

Hover nhãn **Còn lại / ngày** trên Tracker để xem giả định quy đổi đang dùng.

Định mức Capacity / ngày và tỷ lệ CM xem tại **Settings → Capacity formula**. Capacity cá nhân xem **Capacity → Capacity by employee** (không dùng dòng S trên Tracker để confirm từng người).

**Tóm lại**

Còn lại / ngày = (điểm task CM của team Active − workload ngày đó), rồi ÷ 45 (Project → Slides) hoặc ÷ 480 (Creative → DA), làm tròn xuống. Là capacity **team**, không phải từng người.
