---
sidebar_position: 4
sidebar_label: Chia task con
slug: /split-task
---

# Luồng chia task con

Hướng dẫn này mô tả cách **PM hoặc Admin chia một Creative task thành nhiều task nhỏ** trên Pokeslide: điều kiện, thao tác, mã task, đánh giá và các quy tắc liên quan.

:::tip[Chia nhỏ khác Revision]

**Chia nhỏ** = PM hoặc Admin tách khối lượng thành nhiều phần (mã dạng `…-S1`, `-S2`, …) **trước** khi Staff bắt đầu làm.  
**Revision** = tạo bản làm lại (mã dạng `…-R1`) khi task **đã đang chạy** — xem [Luồng tạo revision](/revision).

:::

---

## 1. Sơ đồ tổng quan

```text
Task Creative đã giao cho CM
(đang chờ CM giao Staff)
      │
      ▼
PM hoặc Admin mở "Giao Staff"
      │
      ├── Giao nguyên → 1 Staff làm cả task
      │
      └── Chia nhỏ (ít nhất 2 phần)
            │
            ▼
      Mỗi phần: tên, brief, số lượng (có thể 0), Staff (tuỳ chọn), deadline (tuỳ chọn)
            │
            ▼
      Giao các task nhỏ
            │
            ├── Task gốc: badge "Đã chia nhỏ", SL tổng giữ nguyên (PM đã nhập > 0)
            ├── Task con: …-S1, -S2, … (tổng SL các phần ≤ SL task cha)
            └── Staff nhận thông báo theo phần đã gán người
```

---

## 2. Ai làm gì?

| Việc                                                           | Ai làm được                          |
| -------------------------------------------------------------- | ------------------------------------ |
| Chọn **Chia nhỏ** và tạo task con lần đầu                      | PM, Admin                            |
| Thêm task con sau khi đã chia                                  | PM, Admin                            |
| Sửa **SL tổng** sau khi đã chia                                | Người tạo task (PM), Admin           |
| Sửa số lượng từng task con (tổng không vượt SL tổng)           | CM, người tạo task, Admin            |
| Confirm / làm việc / đánh dấu Finished                         | Staff được giao từng phần            |
| Đánh giá **từng task con**                                     | Creative Manager                     |
| Đánh giá **task gốc** (sau khi các phần xong theo luồng chung) | PM, Creative Head, Department Head   |
| Xem Creative queue / theo dõi task đã chia                     | CM, CH, PM, Admin, Head (theo quyền) |
| Không chia nhỏ                                                 | Creative Head (chỉ giao CM), Staff   |

Creative Manager **không** tạo task con. CM vẫn **Giao nguyên** cho Staff. Chế độ **Chia nhỏ** chỉ hiện với PM và Admin.

---

## 3. Khi nào được chia?

| Điều kiện                                                   | Kết quả                                 |
| ----------------------------------------------------------- | --------------------------------------- |
| Task Creative đã có **SL tổng > 0** (PM nhập lúc tạo)       | Cần                                     |
| Task đang **chờ CM giao Staff** (khung **Nhận từ CH / PM**) | Cần cho lần chia đầu tiên               |
| Người thao tác là **PM hoặc Admin**                         | Cần                                     |
| Chọn **Chia nhỏ** lần đầu                                   | Ít nhất **2** task con                  |
| Đã chia rồi                                                 | PM / Admin thêm task con trong form sửa |

**Từ chối nhận** chỉ khi task còn chờ CM giao Staff — tức **trước** khi chia. Task gốc đã chia **không** từ chối cả cục; xử lý từng task con.

---

## 4. Vào đâu để chia?

1. Mở **Task management → Creative queue**
2. Vào khung **“Nhận từ CH / PM”** (các task đang chờ CM giao Staff)
3. Bấm **Giao Staff** (hoặc **Giao cho Staff** trên màn chi tiết task)
4. Trong form **“Giao task cho Staff”** → PM hoặc Admin chọn **Chia nhỏ**
5. Điền từng phần → bấm **Giao tất cả task nhỏ**

Creative Manager mở cùng form nhưng chỉ thấy **Giao nguyên**.

Sau khi đã chia, PM hoặc Admin mở form sửa task và bấm **Thêm task con**.

Sau khi chia:

- Khung **“Giao Staff”** hiện task gốc với badge **Đã chia nhỏ** và các dòng **Task nhỏ**
- Trên chi tiết task gốc có thao tác kiểu **Sửa / Task nhỏ** hoặc **Đổi Staff / số lượng**

---

## 5. Mỗi task con cần gì?

| Trường            | Bắt buộc                   | Mô tả                                             |
| ----------------- | -------------------------- | ------------------------------------------------- |
| Tên               | Không, nếu đã có loại task | Để trống thì lấy loại task cha (ví dụ Slides, DA) |
| Brief / mô tả     | Có                         | Brief riêng cho phần đó                           |
| Staff             | Không                      | Có thể để trống, gán sau                          |
| Số lượng          | Có                         | Số nguyên từ 0                                    |
| Deadline Creative | Không                      | Để trống thì theo deadline từ task gốc            |

Có thể kèm **ghi chú chung** cho Staff khi giao.

---

## 6. Task gốc và task con sau khi chia

|                   | Task gốc                                                                                      | Task con                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Mã                | Giữ mã cũ                                                                                     | `{mã gốc}-S1`, `-S2`, …                                                                             |
| Nhãn trên UI      | **Đã chia nhỏ**                                                                               | **Task nhỏ**                                                                                        |
| Trạng thái làm    | Không còn là chỗ Staff làm chính                                                              | Đã giao Staff — Staff làm và nộp ở đây                                                              |
| Số lượng          | SL PM nhập lúc tạo, **không** bị ghi đè bằng tổng các phần. Chỉ người tạo task hoặc Admin sửa | Số lượng từng phần, có thể 0. Tổng các phần **scope** (không gồm QA) không được lớn hơn SL task cha |
| Người nhận        | Về phía CM (theo dõi / quản lý)                                                               | Staff từng phần                                                                                     |
| Thông tin kế thừa | —                                                                                             | Project, Level, urgency, tiêu chí, deadline PM, … từ gốc (trừ task con **QA**)                      |

Thứ tự tạo quyết định `-S1`, `-S2`, …. Nếu sau này hệ thống tạo thêm phần còn lại, mã lấy số `S` tiếp theo.

### Task con QA (hỗ trợ)

Khi **PM hoặc Admin** thêm task con sau lần chia, có thể tick **Task QA** và chọn **QA 1 … QA 5** (catalog Task score).

- **Type / tên** task con = **QA** (không kế thừa Slides/DA của cha).
- **Level** = level QA đã chọn (dùng cho capacity / score `QA N`).
- **SL QA** là **SL riêng**: **không** trừ / cộng vào SL tổng task cha; tổng các phần scope vẫn chỉ gồm các task con không phải QA.
- Brief và Staff (có thể để trống) giống task con thường.

---

## 7. Làm việc và đánh giá

1. Staff **confirm / làm / Finished** trên **task con**, không trên task gốc đã chia.
2. **CM đánh giá từng task con**.
3. **PM / Creative Head / Department Head** đánh giá **task gốc** — không thay CM đánh giá từng phần.
4. **Admin** có thể đánh giá cả task con lẫn task gốc (theo quyền).

:::note[Số lượng chấp nhận ít hơn khi đánh giá]

Nếu task con đã **Finished** mà số lượng chấp nhận **nhỏ hơn** số lượng đã giao, hệ thống có thể **tạo thêm một task con mới** (chưa gán Staff) với mã `-S` tiếp theo cho phần còn lại.

:::

---

## 8. Quy tắc cần biết

- Lúc tạo task Creative, PM nhập **số lượng task cha > 0**. Lúc chia, hệ thống **không** ghi đè số lượng đó bằng tổng các phần.
- Tổng số lượng các task con **scope** (không gồm QA) **không được lớn hơn** SL task cha. Phần chưa chia có thể để dành, thêm task con sau.
- Chỉ **PM** và **Admin** tạo task con (lần đầu và khi thêm sau). Creative Manager không tạo task con.
- PM/Admin có thể thêm task con **QA** (tick trong form thêm) để Staff QA lại phần slide / việc của người khác; SL QA không tính vào SL tổng.
- Sau khi chia, **SL tổng** chỉ **người tạo task (PM)** hoặc **Admin** sửa được. CM chỉ sửa số lượng từng task con còn mở, và tổng các phần scope không được vượt SL tổng.
- Task con có thể **số lượng 0** và **chưa gán Staff**. Brief vẫn bắt buộc. Có Staff thì mới gửi thông báo giao việc.
- **Level** task con thường kế thừa từ gốc; task con **QA** dùng level QA 1–5 đã chọn. CM **không** phân loại lại Level lúc chia (Admin / CH đổi Level trước khi Staff confirm, theo quy tắc chung).
- Số lượng task con **khóa** khi Finished / Cancelled; còn Confirmed thì vẫn sửa được trong form sửa.
- Hệ thống **không đếm đôi** số lượng: đếm theo task con, không cộng lại task gốc đã chia.
- Có thể tạo **revision** trên task con (nếu đủ điều kiện) — revision **không** phải chia nhỏ.
- Sau khi đã chọn giao nguyên hoặc chia nhỏ và xác nhận giao, **không** đổi qua lại chế độ trong form giao Staff.

---

## 9. Liên quan tài liệu khác

- Tạo task / CM giao Staff (tóm tắt): [Tạo task mới](/)
- Làm lại sau khi đã chạy: [Luồng tạo revision](/revision)
