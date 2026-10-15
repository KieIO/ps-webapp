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

---

## 5. Decline Creative Task hoạt động thế nào?

Đây là luồng **Creative Head từ chối task PM đã chuyển sang phòng Creative**, không phải chỉ luồng từ chối nội bộ trong Creative.

**Luồng chính (PM ↔ Creative Head)**

1. PM tạo / chuyển task sang phòng Creative.
2. Task vào hàng chờ Creative Head (CH).
3. CH có thể **giao CM** hoặc **Decline** (từ chối nhận từ PM).
4. Sau khi CH Decline: task đánh dấu Decline, **trả về phía PM**, ra khỏi board Creative của CH.
5. PM xử lý tiếp: tạo task mới, hoặc giao lại cho phòng Project (khi cần theo dõi số lần decline), hoặc đưa lại hàng chờ CH nếu muốn gửi Creative lần nữa.

```text
PM chuyển Creative
      │
      ▼
CH nhận trên Creative queue
      │
      ├── Giao CM → tiếp tục luồng Creative
      │
      └── Decline
            │
            ▼
      Trả về PM (ra khỏi board CH)
            │
            ▼
      PM tạo mới / giao Project / gửi lại CH
```

**Khác với từ chối nội bộ Creative**

| Ai từ chối                          | Ý nghĩa                                            |
| ----------------------------------- | -------------------------------------------------- |
| **CH từ chối nhận từ PM**           | Từ chối ở cấp project / handoff phòng. Task về PM. |
| **CM từ chối nhận từ CH**           | Trả lại hàng chờ CH trong phòng Creative.          |
| **Staff từ chối sau khi được giao** | Trả về CM để giao lại / xử lý trong phòng.         |

Câu hỏi / yêu cầu nghiệp vụ gốc nhấn mạnh: cần hỗ trợ **CH từ chối thẳng request của PM**. Không chỉ dừng ở decline giữa CM và Staff.

**Tóm lại**

Decline Creative Task (nghĩa nghiệp vụ chính) = CH không nhận task từ PM → task Declined, về PM. PM quyết định bước tiếp. Từ chối CM↔Staff là luồng nội bộ Creative, khác tầng.

---

## 6. Task giao trong nội bộ Creative: sửa lại scope các task nhỏ được không?

**Được một phần.** Sau khi CM đã **chia nhỏ**, có thể chỉnh lại phạm vi giữa các phần còn mở, trong khuôn khổ SL tổng đã khóa.

### 6.1. Sửa scope (SL) các task nhỏ

**Làm được**

1. Mở task gốc đã chia (hoặc form **Sửa / Task nhỏ**).
2. Phân bổ lại **số lượng** giữa các phần còn mở.
3. Tổng SL các phần phải **khớp SL tổng** của task gốc (ví dụ tổng 20 thì các phần cộng đúng 20).
4. Phần còn mở cũng đổi được **Staff** và **deadline**.

**Không đổi được**

1. **SL tổng** của task gốc sau khi đã chia (ví dụ không đổi 20 → 25 trên cùng họ task đã chia).
2. SL của phần đã **Hoàn thành (Finished)** hoặc **Cancelled** (bị khóa).
3. **Thêm / xóa** task nhỏ sau lần chia ban đầu (hiện chưa hỗ trợ).

Phần còn **Confirmed** hoặc chưa confirm: **vẫn sửa được SL** (không khóa như Finished / Cancelled).

**Ví dụ:** Gốc SL tổng = 20. Phần 1 đã Finished = 8 (khóa). Còn 12 để chia lại giữa phần 2 và 3 (8+4, 7+5, …) miễn tổng vẫn 20.

### 6.2. Cần thêm người / đổi người thì sao?

Mỗi task nhỏ hiện chỉ giao **một Staff**.

Cách xử lý thường dùng:

1. **Đổi Staff** trên phần còn mở (CM / Admin / Head / PM qua form sửa). Người On leave hiện trong danh sách nhưng **không chọn được**.
2. Không thêm người thứ hai trên cùng một phần. Muốn hai người làm phần còn lại: để Staff hiện tại xong một phần → CM **Evaluate / nhận** phần đó → hệ thống có thể tạo phần còn lại (task sibling) → giao Staff khác; hoặc phân bổ lại SL giữa các phần **đã có**, không tạo thêm phần ngoài luồng Evaluate.

### 6.3. QA trước khi trả PM?

Case QA riêng **chưa nằm trong scope** sản phẩm hiện tại. Cần quy trình ngoài hệ thống hoặc chờ bổ sung sau.

Chi tiết luồng chia: [Luồng chia task con](/split-task).

**Tóm lại**

Sửa scope task nhỏ: **có**, bằng cách phân bổ lại SL các phần còn mở cho khớp tổng đã khóa. Không đổi SL tổng, không sửa phần Finished / Cancelled, chưa thêm / xóa phần sau khi chia. Đổi người được trên phần còn mở; thêm người song song thì dùng đổi Staff hoặc tách phần còn lại qua Evaluate.

---

## 7. Task giao trong nội bộ Creative: cancel task nhỏ rồi tạo task mới (giữ số tổng) được không?

**Luồng “Cancel phần A → tạo phần mới thay thế, vẫn giữ SL tổng” chưa được hỗ trợ đủ.** Không dùng Cancel để “đổi chỗ” một phần trong cùng họ chia nhỏ.

**Cancel một task nhỏ thì sao?**

1. Có thể **Cancel** từng phần trong họ đã chia.
2. Phần Cancelled **vẫn nằm trong danh sách**, SL bị **khóa**.
3. Chỉ **Admin** mới mở lại / đổi trạng thái phần đã Cancelled (theo quyền hệ thống).
4. Cancel **không** tự giải phóng SL để tạo thêm task nhỏ mới trong cùng họ với tổng không đổi.

**Khi Staff không làm tiếp được (đã nhận / Confirmed)**

Làm theo hướng này, **không** cần Cancel rồi tạo mới:

1. **Đổi Staff** trên phần đó (kể cả khi đã Confirmed).
2. Hoặc **phân bổ lại SL** giữa các phần còn mở cho khớp tổng.
3. Cần tách một phần (ví dụ 10 slides) cho **hai người**: dùng chỉnh SL / chia phần còn lại / đổi người trên các phần đang mở (xem câu 6). Chưa hỗ trợ “thêm task nhỏ mới” sau lần chia đầu ngoài luồng Evaluate phần còn lại.

**Không nên kỳ vọng**

Cancel “1. Slides” → tạo task mới cùng họ → assign người khác → tổng vẫn 20. Flow này **chưa có**.

**Tóm lại**

Cancel task nhỏ được, nhưng phần đó khóa và không mở chỗ tạo phần thay thế giữ tổng. Muốn đổi người hoặc tách việc: **đổi Staff** và / hoặc **chia lại SL** trên phần còn mở.

---

## 8. Task giao trong nội bộ Creative: nhân viên không làm hết, phải giao phần còn lại cho người khác?

Tùy thời điểm: phần đó **còn đang làm** hay đã **Finished** và CM đánh giá nhận ít hơn SL giao.

### 8.1. Phần còn mở (chưa Finished / Cancelled)

Làm được ngay, **không** cần tạo task mới:

1. **Đổi Staff** trên đúng phần đó (cùng phần, cùng SL).
2. Hoặc **giảm SL** phần của người đang kẹt, **tăng SL** các phần khác còn mở, tổng họ task vẫn khớp.

**Ví dụ:** Tổng 20. A = 8, B = 8, C = 4. Có thể chỉnh A còn 3, B thành 13 (cùng các phần đã có).

Cách này **chưa** tạo người D mới trên một phần “còn lại” tách riêng nếu chưa qua bước đánh giá bên dưới.

### 8.2. Nhân viên làm được một phần, phần còn lại giao người mới (case A còn 4 / 8 → người D)

Đây là case Pokeslide hỏi: cuối ngày A chỉ xong 4, còn 4 phải giao **D**. Chỉ đổi Staff / chia lại giữa A–B–C **không đủ**.

**Cách làm hiện tại**

1. A đánh dấu **Finished** phần mình (hoặc CM xử lý theo quy trình đánh giá).
2. CM **Evaluate** phần đó: nhận SL đã làm (ví dụ 4), **ít hơn** SL đã giao (8).
3. Hệ thống tạo **task nhỏ mới** (phần còn lại, ví dụ SL 4) trong cùng họ chia nhỏ.
4. CM giao task mới đó cho **D**.

Tính năng này nằm ở bước **đánh giá của Creative Manager** theo số lượng chưa nhận hết. Mỗi phần chỉ tách remainder **một lần**.

### 8.3. Phân biệt nhanh

| Tình huống                          | Cách xử lý                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Đổi người cả phần, chưa Finished    | Đổi Staff trên phần đó                                                     |
| Gom / san SL giữa các phần đã có    | Phân bổ lại SL, tổng không đổi                                             |
| Làm dở, phần còn lại giao người mới | Finished → CM Evaluate nhận ít hơn SL giao → task còn lại → giao người mới |

**Tóm lại**

Chưa xong phần: đổi Staff hoặc chia lại SL giữa phần đang mở. Đã làm một phần và cần người mới cho phần còn lại: qua **Evaluate** (nhận SL thấp hơn) để hệ thống tạo task phần còn lại rồi assign.
