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
