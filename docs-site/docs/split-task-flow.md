---
sidebar_position: 4
sidebar_label: Luồng chia task con
slug: /split-task
---

# Luồng chia task con

Hướng dẫn này mô tả cách **Creative Manager chia một Creative task thành nhiều task nhỏ** trên Pokeslide: điều kiện, thao tác, mã task, đánh giá và các rule liên quan.

:::tip[Chia nhỏ khác Revision]

**Chia nhỏ** = CM tách workload thành nhiều phần (`…-S1`, `-S2`, …) trước khi Staff làm.  
**Revision** = tạo bản làm lại (`…-R1`) sau khi đã có task đang chạy — xem [Luồng tạo revision](/revision).

:::

---

## 1. Sơ đồ tổng quan

```text
Task Creative đã giao CM
(stage: awaiting_cm)
      │
      ▼
CM mở "Giao Staff"
      │
      ├── Giao nguyên → 1 Staff làm cả task
      │
      └── Chia nhỏ (≥ 2 phần)
            │
            ▼
      Mỗi phần: tên, brief, Staff, SL, deadline (tuỳ chọn)
            │
            ▼
      Giao tất cả task nhỏ
            │
            ├── Task gốc: "Đã chia nhỏ", SL = tổng SL con
            ├── Task con: …-S1, -S2, … (Staff làm trên task con)
            └── Staff nhận thông báo theo từng phần
```

---

## 2. Ai làm gì?

| Việc                                         | Ai làm được                          |
| -------------------------------------------- | ------------------------------------ |
| Chọn **Chia nhỏ** và tạo task con            | CM (task đang giao mình), Admin, PM  |
| Làm việc / confirm / Finished trên task con  | Staff được giao từng phần            |
| Đánh giá **từng task con** (layer CM)        | Creative Manager                     |
| Đánh giá **task gốc** (layer PM / CH / Head) | PM, Creative Head, Head              |
| Xem queue Creative / theo dõi split          | CM, CH, PM, Admin, Head (theo quyền) |
| Không chia nhỏ                               | Creative Head (chỉ giao CM), Staff   |

CH **không** mở chế độ chia — CH giao CM; CM mới chọn giao nguyên hoặc chia nhỏ.

---

## 3. Khi nào được chia?

| Điều kiện                                      | Kết quả                                      |
| ---------------------------------------------- | -------------------------------------------- |
| Task thuộc phòng **Creative**                  | Cần                                          |
| Pipeline stage **`awaiting_cm`** (chờ CM giao) | Cần                                          |
| CM đang được assign task đó (hoặc Admin / PM)  | Cần                                          |
| Chọn mode **Chia nhỏ**                         | Ít nhất **2** task con                       |
| Đã giao Staff (nguyên hoặc chia) rồi           | **Không** đổi lại mode qua drawer giao Staff |

Từ chối nhận (`Từ chối nhận`) chỉ khi còn `awaiting_cm` — **trước** khi chia. Task gốc đã chia **không** decline cả cục; xử lý từng task con.

---

## 4. Vào đâu để chia?

1. Mở **Task management → Creative queue**
2. Frame **“Nhận từ CH / PM”** (task `awaiting_cm`)
3. Bấm **Giao Staff** (hoặc CTA **Giao cho Staff** trên chi tiết task)
4. Drawer **“Giao task cho Staff”** → chọn **Chia nhỏ**
5. Điền từng phần → **Giao tất cả task nhỏ**

Sau khi chia:

- Frame **“Giao Staff”** hiện task gốc badge **Đã chia nhỏ** và các **Task nhỏ**
- Chi tiết gốc có thao tác kiểu **Sửa / Task nhỏ** hoặc **Đổi Staff / SL** (drawer sửa pipeline)

---

## 5. Mỗi task con cần gì?

| Trường            | Bắt buộc | Mô tả                                      |
| ----------------- | -------- | ------------------------------------------ |
| Tên               | Có       | Tên phần (VD: `{tên gốc} - phần 1`)        |
| Brief / mô tả     | Có       | Brief riêng cho phần đó                    |
| Staff             | Có       | Creative Staff (CM có thể tự nhận làm)     |
| Số lượng (SL)     | Có       | > 0                                        |
| Deadline Creative | Không    | Trống thì theo rule / deadline từ task gốc |

Có thể kèm ghi chú chung cho Staff trên payload giao.

---

## 6. Task gốc và task con sau khi chia

|          | Task gốc (parent)                        | Task con (split)                                         |
| -------- | ---------------------------------------- | -------------------------------------------------------- |
| Mã       | Giữ mã cũ                                | `{mã gốc}-S1`, `-S2`, …                                  |
| Badge    | **Đã chia nhỏ**                          | **Task nhỏ**                                             |
| Stage    | `split`                                  | `assigned_staff` (Staff làm ở đây)                       |
| SL       | = **tổng SL** các con (khóa theo tổng)   | SL từng phần                                             |
| Assignee | Về phía CM (shell); không làm work chính | Staff từng phần                                          |
| Inherit  | —                                        | Project, Level, urgency, criteria, deadline PM, … từ gốc |

Thứ tự tạo quyết định `-S1`, `-S2`, …. Phần sinh thêm sau (ví dụ remainder) lấy số `S` tiếp theo.

---

## 7. Làm việc và đánh giá

1. Staff **confirm / làm / Finished** trên **task con**, không trên task gốc đã chia.
2. **CM đánh giá từng task con** (layer CM).
3. **PM / CH / Head** đánh giá **task gốc** (layer handoff) — không thay CM đánh giá từng phần.
4. **Admin** có thể thao tác cả hai layer.

:::note[SL nhận ít hơn khi đánh giá]

Nếu task con **Finished** mà SL chấp nhận **&lt;** SL đã giao, hệ thống có thể **sinh thêm một task con sibling** (chưa gán Staff) với mã `-S` tiếp theo cho phần còn lại.

:::

---

## 8. Rule cần biết

- Tổng SL các con **không bắt buộc** khớp SL PM ghi lúc tạo task — sau khi chia, tổng con trở thành SL khóa của gốc.
- **Level** kế thừa từ gốc; CM **không** phân loại lại Level lúc chia (Admin / CH đổi Level trước khi Staff confirm, theo rule chung).
- SL task con **khóa** khi Finished / Cancelled; còn Confirmed thì vẫn sửa được trong drawer edit.
- Hệ thống **không đếm đôi** SL: đếm theo task con, không cộng lại task gốc đã chia.
- Có thể tạo **revision** trên task con (nếu đủ điều kiện đánh giá) — revision **không** phải split.
- Sau khi đã chọn giao nguyên hoặc chia nhỏ và submit, **không** đổi qua lại mode trong drawer giao Staff.

---

## 9. Liên quan tài liệu khác

- Tạo task / CM giao Staff (tóm tắt): [Tạo task mới](/)
- Làm lại sau khi đã chạy: [Luồng tạo revision](/revision)
