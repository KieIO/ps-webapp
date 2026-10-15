---
sidebar_position: 4
sidebar_label: Chia task con
slug: /split-task
---

# Luồng chia task con

Hướng dẫn này mô tả cách **Creative Manager chia một Creative task thành nhiều task nhỏ** trên Pokeslide: điều kiện, thao tác, mã task, đánh giá và các quy tắc liên quan.

:::tip[Chia nhỏ khác Revision]

**Chia nhỏ** = CM tách khối lượng thành nhiều phần (mã dạng `…-S1`, `-S2`, …) **trước** khi Staff bắt đầu làm.  
**Revision** = tạo bản làm lại (mã dạng `…-R1`) khi task **đã đang chạy** — xem [Luồng tạo revision](/revision).

:::

---

## 1. Sơ đồ tổng quan

```text
Task Creative đã giao cho CM
(đang chờ CM giao Staff)
      │
      ▼
CM mở "Giao Staff"
      │
      ├── Giao nguyên → 1 Staff làm cả task
      │
      └── Chia nhỏ (ít nhất 2 phần)
            │
            ▼
      Mỗi phần: tên, brief, Staff, số lượng, deadline (tuỳ chọn)
            │
            ▼
      Giao tất cả task nhỏ
            │
            ├── Task gốc: badge "Đã chia nhỏ", số lượng = tổng các phần
            ├── Task con: …-S1, -S2, … (Staff làm trên từng phần)
            └── Staff nhận thông báo theo từng phần
```

---

## 2. Ai làm gì?

| Việc                                                           | Ai làm được                          |
| -------------------------------------------------------------- | ------------------------------------ |
| Chọn **Chia nhỏ** và tạo task con                              | CM (task đang giao mình), Admin, PM  |
| Confirm / làm việc / đánh dấu Finished                         | Staff được giao từng phần            |
| Đánh giá **từng task con**                                     | Creative Manager                     |
| Đánh giá **task gốc** (sau khi các phần xong theo luồng chung) | PM, Creative Head, Department Head   |
| Xem Creative queue / theo dõi task đã chia                     | CM, CH, PM, Admin, Head (theo quyền) |
| Không chia nhỏ                                                 | Creative Head (chỉ giao CM), Staff   |

Creative Head **không** mở chế độ chia — CH giao cho CM; CM mới chọn **Giao nguyên** hoặc **Chia nhỏ**.

---

## 3. Khi nào được chia?

| Điều kiện                                                   | Kết quả                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Task thuộc phòng **Creative**                               | Cần                                            |
| Task đang **chờ CM giao Staff** (khung **Nhận từ CH / PM**) | Cần                                            |
| CM đang được giao task đó (hoặc Admin / PM thao tác hộ)     | Cần                                            |
| Chọn **Chia nhỏ**                                           | Ít nhất **2** task con                         |
| Đã giao Staff (nguyên hoặc chia) rồi                        | **Không** đổi lại chế độ trong form giao Staff |

**Từ chối nhận** chỉ khi task còn chờ CM giao Staff — tức **trước** khi chia. Task gốc đã chia **không** từ chối cả cục; xử lý từng task con.

---

## 4. Vào đâu để chia?

1. Mở **Task management → Creative queue**
2. Vào khung **“Nhận từ CH / PM”** (các task đang chờ CM giao Staff)
3. Bấm **Giao Staff** (hoặc **Giao cho Staff** trên màn chi tiết task)
4. Trong form **“Giao task cho Staff”** → chọn **Chia nhỏ**
5. Điền từng phần → bấm **Giao tất cả task nhỏ**

Sau khi chia:

- Khung **“Giao Staff”** hiện task gốc với badge **Đã chia nhỏ** và các dòng **Task nhỏ**
- Trên chi tiết task gốc có thao tác kiểu **Sửa / Task nhỏ** hoặc **Đổi Staff / số lượng**

---

## 5. Mỗi task con cần gì?

| Trường            | Bắt buộc | Mô tả                                            |
| ----------------- | -------- | ------------------------------------------------ |
| Tên               | Có       | Tên phần (ví dụ: `{tên gốc} - phần 1`)           |
| Brief / mô tả     | Có       | Brief riêng cho phần đó                          |
| Staff             | Có       | Creative Staff (CM có thể tự nhận làm)           |
| Số lượng          | Có       | Lớn hơn 0                                        |
| Deadline Creative | Không    | Để trống thì theo quy tắc / deadline từ task gốc |

Có thể kèm **ghi chú chung** cho Staff khi giao.

---

## 6. Task gốc và task con sau khi chia

|                   | Task gốc                                      | Task con                                                 |
| ----------------- | --------------------------------------------- | -------------------------------------------------------- |
| Mã                | Giữ mã cũ                                     | `{mã gốc}-S1`, `-S2`, …                                  |
| Nhãn trên UI      | **Đã chia nhỏ**                               | **Task nhỏ**                                             |
| Trạng thái làm    | Không còn là chỗ Staff làm chính              | Đã giao Staff — Staff làm và nộp ở đây                   |
| Số lượng          | = **tổng số lượng** các phần (khóa theo tổng) | Số lượng từng phần                                       |
| Người nhận        | Về phía CM (theo dõi / quản lý)               | Staff từng phần                                          |
| Thông tin kế thừa | —                                             | Project, Level, urgency, tiêu chí, deadline PM, … từ gốc |

Thứ tự tạo quyết định `-S1`, `-S2`, …. Nếu sau này hệ thống tạo thêm phần còn lại, mã lấy số `S` tiếp theo.

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

- Tổng số lượng các phần **không bắt buộc** khớp số lượng PM ghi lúc tạo task — sau khi chia, tổng các phần trở thành số lượng khóa của task gốc.
- **Level** kế thừa từ gốc; CM **không** phân loại lại Level lúc chia (Admin / CH đổi Level trước khi Staff confirm, theo quy tắc chung).
- Số lượng task con **khóa** khi Finished / Cancelled; còn Confirmed thì vẫn sửa được trong form sửa.
- Hệ thống **không đếm đôi** số lượng: đếm theo task con, không cộng lại task gốc đã chia.
- Có thể tạo **revision** trên task con (nếu đủ điều kiện) — revision **không** phải chia nhỏ.
- Sau khi đã chọn giao nguyên hoặc chia nhỏ và xác nhận giao, **không** đổi qua lại chế độ trong form giao Staff.

---

## 9. Liên quan tài liệu khác

- Tạo task / CM giao Staff (tóm tắt): [Tạo task mới](/)
- Làm lại sau khi đã chạy: [Luồng tạo revision](/revision)
