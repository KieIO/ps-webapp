---
sidebar_position: 1
sidebar_label: FAQ
slug: /faq
---

# FAQ

Câu hỏi thường gặp khi dùng PokeSlide.

---

## 1. Đổi Level / Position code rồi mà Job title hoặc capacity không đổi?

**Triệu chứng**

1. Save xong Users lệch: Code đã Level 4 nhưng Job title còn Level 1.
2. Capacity cá nhân không tăng theo title mới.
3. Nhìn dòng **S** trên Tracker rồi tưởng đó là capacity từng người.

**Cách sửa đúng**

1. Mở edit user.
2. Đổi **Level** nếu cần (khi đổi Level, **Position code** bị reset).
3. Chọn lại **Position code** hoặc **Job title** cho khớp Level mới. Hai field này luôn đi cặp.
4. Trước Save: Code và Title cùng một level (ví dụ PE-4 với Job title Level 4).
5. Save.

**Verify**

1. **Users**: Code và Job title cùng level.
2. **Capacity → Capacity by employee**: đúng title / level mới.
3. Định mức điểm / ngày: **Settings → Capacity formula**.
4. **Tracker**: dòng **S** / **Còn lại** là capacity **team theo ngày**, không phải quota một người. Xem thêm câu 4.

| Title | Điểm / ngày (khoảng) | Quy ra slides (điểm ÷ 45) |
| ----- | -------------------- | ------------------------- |
| PE-1  | ~480                 | ~10 slides                |
| PE-4  | ~633                 | ~14 slides                |

Số trên Settings có thể đổi theo công thức thực tế.

**Tóm lại:** Đổi Level xong phải chọn lại Code / Title cho khớp rồi Save. Capacity cá nhân xem ở Capacity by employee; Tracker chỉ phản ánh team.

---

## 2. Đổi chức vụ rồi, dữ liệu kỳ trước có giữ nguyên không?

Không phải mọi thứ đều giữ theo title cũ. Tùy loại dữ liệu.

**Giữ nguyên**

| Loại                                                   | Giải thích                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Task và lịch sử làm việc                               | Task gắn theo người. Đổi title không làm mất hay chuyển task kỳ trước.                 |
| KPI theo tháng (On-time, Quality, Revision, Output, …) | Tính từ task / đánh giá trong tháng đó. Đổi title sau **không** tính lại tháng đã qua. |

**Ví dụ:** Nhân viên đang Junior trong tháng 9 (12 task, on-time 90%, quality 4.2), ngày 15/10 lên Senior. Mở lại tháng 9 vẫn thấy 12 task, 90% và 4.2.

**Tính lại theo title hiện tại**

| Loại                                       | Giải thích                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Capacity %, target output, ranking theo kỳ | Không lưu title theo từng tháng. Xem tháng cũ vẫn lấy Capacity / ngày của **title hiện tại**, nên % có thể khác lúc còn title cũ. |

**Ví dụ:** Tháng 9 capacity ~80% khi còn Junior. Sau lên Senior, mở lại tháng 9 có thể thấy ~50% dù lượng task không đổi.

**Chức danh trên profile / Capacity:** luôn hiện **title hiện tại**. Chưa có lịch sử title theo kỳ.

**Tóm lại:** Task và KPI tháng cũ giữ nguyên. Capacity %, target, ranking và cột chức danh khi xem lại theo **title hiện tại**.

---

## 3. Nghỉ phép nhiều đợt rời nhau thì làm sao?

Ví dụ 30/09→16/10, rồi 26/10, 20/11, rồi 10/12→20/12. **Mỗi khoảng liền phải Schedule leave một lần.** Không gộp ngày rời thành một kỳ.

**Cách lên lịch**

1. **Users** → nhân viên **Active** → **Leave**, hoặc **User detail** → **Schedule leave**.
2. Chọn ngày bắt đầu / kết thúc, lý do tuỳ chọn.
3. Xem task trong kỳ → chọn người thay hoặc để trống.
4. **Confirm leave**. Thêm đợt khác: Schedule khoảng mới (không chồng). Wizard hiện **Already booked** và khoá ngày đã chiếm.

**Quy tắc**

1. Mỗi Confirm = **một khoảng liên tục**.
2. Nhiều kỳ được, miễn **không chồng lịch**.
3. Nghỉ **tương lai**: vẫn **Active** đến ngày bắt đầu, rồi mới **On leave**.
4. Kỳ **cover hôm nay**: **On leave** ngay sau Confirm.
5. Đang **On leave**: vẫn **login được**; **không** giao task mới. Tracker **không** hiện tên nghỉ T7/CN.
6. Hết kỳ đúng hạn: **tự Active** (không cần Admin Activate). Kỳ tương lai đã lên lịch vẫn giữ.
7. Đi làm sớm: **Cancel leave** từng kỳ → Active ngay nếu đang On leave vì kỳ đó.

```text
Active → Schedule + Confirm → (tới ngày) On leave → hết kỳ → tự Active
```

Chi tiết: [Luồng nghỉ phép](/leave).

**Tóm lại:** Ngày rời nhau → Schedule từng khoảng. Hết nghỉ hệ thống tự Active; On leave vẫn login được.

---

## 4. Dòng “Còn lại / ngày” trên Project Tracker tính thế nào?

Ước lượng **output còn lại của cả team theo ngày** (Slides hoặc DA) sau khi trừ việc đã giao. **Không** phải quota một người.

**Nguồn điểm** (nhân viên **Active**, không On leave):

```text
Điểm task CM = Capacity / ngày × tỷ lệ CM / quản lý (%)
```

1. **PM, Creative Manager:** theo tỷ lệ title (ví dụ PM-5: 994 × 30% = 298).
2. **Staff thường:** tỷ lệ 100% → điểm = Capacity / ngày.

Tracker dùng **điểm task CM**, không dùng nguyên Capacity / ngày (tránh case PM-5 hiện ~22 S thay vì ~6 S).

**Mỗi ngày**

1. Cộng điểm task CM của team Active trong phòng.
2. Trừ điểm việc đã giao trong ngày.
3. Quy đổi: Project → điểm còn lại ÷ **45** = **Slides** (chuẩn Level 3); Creative → ÷ **480** = **DA** (chuẩn Level 2).
4. **Làm tròn xuống**.

**Ví dụ:** 1 PM-5, chưa có việc → 298 ÷ 45 ≈ 6.62 → hiện **6 S**.

Hover nhãn **Còn lại / ngày** để xem giả định quy đổi. Định mức: **Settings → Capacity formula**. Cá nhân: **Capacity by employee**.

**Tóm lại:** (điểm task CM team − việc trong ngày), rồi ÷ 45 hoặc ÷ 480, làm tròn xuống. Là capacity **team**.

---

## 5. Decline Creative Task hoạt động thế nào?

Luồng **Creative Head từ chối task PM đã chuyển sang Creative**, khác với từ chối nội bộ trong phòng Creative.

**Luồng chính**

1. PM chuyển task sang Creative.
2. Task vào hàng chờ **Creative Head (CH)**.
3. CH **giao CM** hoặc **Decline**.
4. Decline → task đánh dấu Decline, **trả về PM**, ra khỏi board CH.
5. PM tạo task mới, giao phòng Project, hoặc gửi lại CH.

```text
PM chuyển Creative → CH nhận
  ├── Giao CM → tiếp tục Creative
  └── Decline → về PM → PM tạo mới / giao Project / gửi lại CH
```

| Ai từ chối                          | Ý nghĩa                                            |
| ----------------------------------- | -------------------------------------------------- |
| **CH từ chối nhận từ PM**           | Từ chối nhận việc từ PM sang Creative. Task về PM. |
| **CM từ chối nhận từ CH**           | Trả lại hàng chờ CH trong Creative.                |
| **Staff từ chối sau khi được giao** | Trả về CM để giao lại trong phòng.                 |

**Tóm lại:** Decline Creative Task (nghĩa chính) = CH không nhận từ PM → về PM. Từ chối CM / Staff là tầng nội bộ Creative.

---

## Task giao trong nội bộ Creative (câu 6–10)

Sau khi CM **chia nhỏ** task Creative. Chi tiết luồng chia: [Luồng chia task con](/split-task).

**Phần còn mở** = task nhỏ **chưa** Finished và **chưa** Cancelled (kể cả đã Confirmed). Chỉ các phần này còn sửa được SL / Staff / deadline.

Quy tắc chung sau khi chia:

1. **SL tổng** và tổng SL các phần phải **khớp**. Có thể **đổi SL tổng** sau khi chia (form sửa): hệ thống điều chỉnh phần còn mở; phần Finished / Cancelled giữ nguyên. Tổng mới không được nhỏ hơn tổng các phần đã khóa.
2. Mỗi phần một **Staff**. Có thể đổi Staff / deadline / SL trên phần còn mở.
3. Phần **Finished** hoặc **Cancelled**: SL khóa.
4. **Không** thêm / xóa phần tùy ý sau lần chia đầu (trừ tách phần còn lại khi Evaluate, câu 8).

---

## 6. Sửa lại scope các task nhỏ được không?

**Được một phần:** đổi SL tổng và / hoặc phân bổ lại SL giữa các phần còn mở; tổng các phần phải khớp SL tổng.

**Làm được**

1. Mở task gốc đã chia (form **Sửa / Task nhỏ**).
2. Đổi **SL tổng** (ví dụ 20 → 25); hệ thống điều chỉnh phần còn mở cho khớp.
3. Chia lại **số lượng** các phần còn mở; tổng = SL tổng.
4. Đổi **Staff** / **deadline** trên phần còn mở.

**Không làm được**

1. Sửa SL phần Finished / Cancelled.
2. Thêm / xóa task nhỏ tùy ý sau lần chia đầu.
3. Đổi SL tổng xuống thấp hơn tổng các phần đã khóa (Finished / Cancelled).

**Ví dụ:** Tổng 20. Phần 1 Finished = 8 (khóa). Có thể tăng SL tổng lên 25 (phần còn mở nhận thêm). Có thể chia lại 12 còn lại giữa phần 2 và 3. Không giảm tổng xuống dưới 8 + phần mở tối thiểu.

Muốn hai người cùng làm phần còn lại: đổi Staff, chia lại SL giữa phần đã có, hoặc tách phần còn lại qua Evaluate (câu 8). QA riêng **chưa trong scope**.

**Tóm lại:** Sửa scope = đổi SL tổng (kèm điều chỉnh phần mở) và / hoặc chia lại SL phần còn mở cho khớp tổng. Không sửa Finished / Cancelled, chưa thêm / xóa phần tùy ý.

---

## 7. Cancel task nhỏ rồi tạo task mới (giữ số tổng) được không?

**Chưa hỗ trợ đủ.** Không dùng Cancel để “đổi chỗ” một phần trong cùng họ.

**Cancel một phần thì sao?**

1. Cancel từng phần được; phần đó vẫn trong list, SL **khóa**.
2. Thường chỉ **Admin** mở lại trạng thái phần Cancelled.
3. Cancel **không** giải phóng SL để tạo phần mới thay thế với tổng không đổi.

**Staff không làm tiếp (kể cả đã Confirmed):** đổi **Staff** hoặc chia lại SL phần còn mở. Không Cancel rồi tạo mới.

**Không kỳ vọng:** Cancel “1. Slides” → tạo task mới cùng họ → giao người khác → tổng vẫn 20.

**Tóm lại:** Cancel được nhưng khóa phần đó. Muốn đổi người / tách việc → đổi Staff hoặc chia lại SL (hoặc Evaluate, câu 8).

---

## 8. Nhân viên không làm hết, phải giao phần còn lại cho người khác?

Tùy phần đó **còn mở** hay đã **Finished** và CM nhận ít hơn SL giao.

### Còn mở (chưa Finished / Cancelled)

1. **Đổi Staff** trên đúng phần (cùng phần, cùng SL), hoặc
2. **Giảm SL** phần của người đang kẹt, **tăng SL** các phần khác còn mở (tổng họ không đổi).

**Ví dụ:** Tổng 20, chia 3 phần (8 + 8 + 4). Có thể chỉnh thành 3 + 13 + 4. Cách này chỉ san giữa **các phần / người đã có**. **Chưa** tạo thêm một phần mới cho **nhân viên mới** (người chưa nằm trong các phần hiện tại).

### Đã làm một phần, phần còn lại giao người mới

Ví dụ: một phần giao SL 8 cho nhân viên đang làm. Cuối ngày chỉ xong 4. Muốn 4 còn lại giao cho **nhân viên khác** (chưa có phần trong họ task):

1. Nhân viên đang làm đánh dấu **Finished** (hoặc CM xử lý đánh giá).
2. CM **Evaluate**: nhận SL đã làm (4) **&lt;** SL đã giao (8).
3. Hệ thống tạo **task nhỏ mới** (phần còn lại, SL 4) trong cùng họ.
4. CM giao task mới đó cho nhân viên kia.

Mỗi phần chỉ tách phần còn lại **một lần** khi Evaluate.

| Tình huống                         | Cách xử lý                                                      |
| ---------------------------------- | --------------------------------------------------------------- |
| Đổi người cả phần, chưa Finished   | Đổi Staff                                                       |
| San SL giữa phần đã có             | Phân bổ lại SL, tổng không đổi                                  |
| Làm dở, phần còn lại cho người mới | Finished → Evaluate nhận ít hơn → task còn lại → giao người mới |

**Tóm lại:** Còn mở → đổi Staff hoặc chia lại SL. Làm dở cần người mới → Evaluate nhận SL thấp hơn để tạo task phần còn lại.

---

## 9. Giảm scope người này, tăng người kia (hoặc thêm người hỗ trợ)?

**Giảm SL phần người này, tăng phần người kia** trên phần còn mở hoặc Confirmed: **được**, tổng khớp (cùng cách câu 6 và phần “Còn mở” ở câu 8). Không lấy SL từ Finished / Cancelled.

**Thêm người hỗ trợ**

| Nhu cầu                                   | Hiện tại         |
| ----------------------------------------- | ---------------- |
| Đổi người trên phần đang có               | Được             |
| San SL giữa phần đã có                    | Được             |
| Tách phần còn lại sau khi làm dở          | Evaluate (câu 8) |
| Thêm task nhỏ / QA tùy ý sau lần chia đầu | **Chưa**         |

**Tóm lại:** San scope giữa phần mở được. Thêm người ngoài phần đã có: chủ yếu Evaluate; chưa thêm task / QA tùy ý.

---

## 10. Plan trước một phần (ví dụ 10/20), phần còn lại plan sau?

**Chưa hỗ trợ.** Có thể bổ sung sau.

Khi chia nhỏ phải **giao đủ các phần ngay**. Mỗi phần **bắt buộc chọn Staff** (UI: “Chọn Staff”; hệ thống không cho tạo phần trống người nhận). SL tổng khóa theo tổng phần đã tạo. Sau đó chỉ chia lại SL / đổi người trong phần **đã có**.

**Không** giữ “10 chưa plan” trên tổng 20 rồi bổ sung phần sau.

**Workaround “tạo phần chưa assign, sau mới giao”?** **Không.** Không tạo được task nhỏ mà bỏ trống người nhận.

Workaround gần nhất (không phải plan dở đúng nghĩa): lúc chia vẫn phải chọn người cho mọi phần. Có thể **giao tạm** một người (kể cả CM tự nhận), sau đó **đổi Staff** trên phần còn mở khi đã biết ai làm. Phần đó vẫn đã chiếm SL trong tổng khóa; không phải slot “chưa plan”.

Phần còn lại **sau khi làm dở**: dùng Evaluate (câu 8), không phải chừa phần chưa giao từ đầu.

**Tóm lại:** Plan dở 10/20 trên cùng tổng đã chốt: chưa làm được. Không tạo phần không có Staff. Chỉ giao tạm rồi đổi người sau, hoặc Evaluate khi làm dở.

---

## Technical debt (theo dõi làm sau)

Rà từ FAQ và feedback sản phẩm. Chỉ liệt kê **khoảng trống** (chưa làm / làm một phần), không gồm thứ đã có workaround ổn.

Phần **Tracker / mốc giao** bên dưới: Goware có thể hỗ trợ sau **go-live** (chưa nằm trong phạm vi đóng gói hiện tại).

### Task giao trong nội bộ Creative (câu 6–10)

| #   | Khoảng trống                                                                 | Ghi chú ngắn                                                                                                                                                         | Nguồn       |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Thêm / xóa task nhỏ **tùy ý** sau lần chia đầu                               | Hiện chỉ tách phần còn lại khi CM Evaluate nhận SL thấp hơn (câu 8). Không thêm phần hỗ trợ tự do.                                                                   | Câu 6, 8, 9 |
| 2   | Task nhỏ loại **QA** (hoặc loại hỗ trợ riêng) trong họ chia                  | Chưa có loại / luồng QA trước khi trả PM.                                                                                                                            | Câu 6, 9    |
| 3   | Tạo task nhỏ **chưa gán Staff**, assign sau                                  | Mỗi phần bắt buộc chọn Staff lúc chia.                                                                                                                               | Câu 10      |
| 4   | **Plan dở** trên SL tổng đã chốt (ví dụ giao 10/20, phần còn lại plan sau)   | Phải giao đủ phần ngay; không giữ slot “chưa plan”.                                                                                                                  | Câu 10      |
| 5   | **Cancel** một phần rồi **tạo phần mới thay thế**, vẫn giữ SL tổng           | Cancel khóa phần đó, không giải phóng SL để tạo phần thay.                                                                                                           | Câu 7       |
| 6   | Lấy SL từ phần **Finished / Cancelled** chuyển sang người khác bằng form sửa | Form sửa không bớt SL phần đã xong / đã hủy để chuyển người khác. Chỉ chỉnh được các phần **chưa** Finished / Cancelled (hoặc tăng SL tổng rồi đẩy vào các phần đó). | Câu 6, 8, 9 |
| 7   | Một task nhỏ giao **nhiều Staff** cùng lúc                                   | Mỗi phần một người.                                                                                                                                                  | Câu 6, 9    |

### Khác (ngoài Creative split)

| #   | Khoảng trống                                                                  | Ghi chú ngắn                                                     | Nguồn |
| --- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----- |
| 8   | **Lịch sử chức danh theo kỳ** (profile / Capacity / tính Capacity % tháng cũ) | UI và Capacity % luôn theo title hiện tại; KPI tháng cũ thì giữ. | Câu 2 |

### Tracker / mốc giao (milestone), sau go-live

| #   | Khoảng trống                                                                               | Ghi chú ngắn                                                                                                                                                                                                                               | Nguồn                          |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| 9   | **Giờ cụ thể + thứ tự hiển thị** trên Tracker cho case urgent                              | Ví dụ tên / ghi chú: `Full V1 - 3pm FR`, `Full V1 - 5pm HCM` (giờ có thể để trong ghi chú). PM muốn sắp thứ tự project trên Tracker (deadline sớm lên đầu, EOD để sau) để dễ quan sát và quản lý. Hiện chưa tối ưu đủ theo pain point này. | Feedback Pokeslide (milestone) |
| 10  | **Chấm mốc linh hoạt ngoài timeline project** (ngày nhận feedback, todo, note ngoài range) | Đôi khi dùng chấm mốc để note ngày feedback / todo / việc khác. Khi đó chấm có thể nằm **ngoài** timeline project. Cần chỉnh để linh hoạt hơn, không cứng trong range project.                                                             | Feedback Pokeslide (milestone) |

### Creative queue

| #   | Khoảng trống                                                  | Ghi chú ngắn                                                                                                                            | Nguồn                       |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 11  | **Bộ lọc trên Creative queue** (cùng kiểu trang Quản lý task) | Creative queue chưa lọc được như Quản lý task. Cần xem task nào đã chia, chia ngày nào, tình trạng đánh giá, và các thông tin tương tự. | Feedback khách (26/10/2026) |

**Không xếp vào debt ở đây** (đã có hoặc đúng thiết kế hiện tại): đổi Staff / chia lại SL phần còn mở; **đổi SL tổng** sau khi chia (trong giới hạn phần đã khóa); Evaluate tạo phần còn lại khi làm dở; Decline CH từ PM; nghỉ nhiều kỳ + Activate; Tracker dùng điểm task CM; CRUD mốc giao cơ bản trên form Project / Tracker ([Mốc giao](/milestone)).

Khi làm xong một mục, team Dev cập nhật FAQ / doc liên quan và gạch mục tương ứng trong bảng này.
