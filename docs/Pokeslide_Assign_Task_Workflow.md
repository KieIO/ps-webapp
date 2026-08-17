# Pokeslide — Assign Task Workflow

**Cập nhật:** 16/05/2026

---

## Tổng quan

```
PM tạo task
    │
    ├── A. Project Task → PM fill brief → assign cho Project Staff
    │                                  → assign cho chính mình (PM)
    │                                  → hoặc chuyển sang Creative (kèm brief)
    │
    └── B. Creative Task → PM KHÔNG fill brief → Creative Head xử lý
```

> **Lưu ý:** Chỉ PM mới có quyền tạo task.
> CH và CM không tự tạo task nội bộ — mọi task đều bắt đầu từ PM.

---

## Quyền tạo task theo role

| Role                 | Tạo task? | Ghi chú                                               |
| -------------------- | --------- | ----------------------------------------------------- |
| **Head**             | ❌        | Tạo project, duyệt OT, không tạo task                 |
| **PM**               | ✅        | Người duy nhất tạo task; có thể assign cho chính mình |
| **Creative Head**    | ❌        | Nhận task từ PM → fill brief → assign CM              |
| **Creative Manager** | ❌        | Nhận task từ CH → chia nhỏ → assign Staff             |
| **Employee / Staff** | ❌        | Nhận task, thực hiện                                  |

---

## A. Task thuộc Project Department

**Bước 1 — PM tạo task & fill brief**

- PM tạo task và fill đầy đủ thông tin brief (mô tả, yêu cầu, file đính kèm)
- PM phân loại độ khó theo 3 tiêu chí → hệ thống tính Level task (1–4)

**Bước 2 — PM chọn hướng assign**

Sau khi hoàn tất brief, PM chọn 1 trong 3:

> **Hướng 1:** Assign trực tiếp cho Project Staff
> **Hướng 2:** Assign cho chính mình (PM tự thực hiện)
> **Hướng 3:** Chuyển task sang Creative Department

---

### Hướng 1 — Assign cho Project Staff

| Bước | Người thực hiện | Hành động                                                         |
| ---- | --------------- | ----------------------------------------------------------------- |
| 3    | PM              | Chọn Staff nhận task (check workload, tránh Overloaded/nghỉ phép) |
| 4    | Project Staff   | Confirm task trong vòng 15 phút                                   |
| 5    | Project Staff   | Thực hiện → đánh dấu hoàn thành                                   |
| 6    | PM              | Review & đánh giá kết quả theo 3 tiêu chí                         |

---

### Hướng 2 — PM tự assign cho chính mình

| Bước | Người thực hiện | Hành động                               |
| ---- | --------------- | --------------------------------------- |
| 3    | PM              | Chọn bản thân làm assignee              |
| 4    | PM              | Tự confirm task (không cần chờ 15 phút) |
| 5    | PM              | Thực hiện → đánh dấu hoàn thành         |
| 6    | Head            | Review & đánh giá PM (nếu cần)          |

> 💡 Task PM tự assign sẽ hiển thị trong **My Tasks** của PM.

---

### Hướng 3 — Chuyển sang Creative Department

| Bước | Người thực hiện  | Hành động                                                |
| ---- | ---------------- | -------------------------------------------------------- |
| 3    | PM               | Chuyển task kèm brief đã fill sang Creative Department   |
| 4    | Creative Head    | Nhận task — **brief có sẵn, không cần fill lại**         |
| 5    | Creative Head    | Assign cho Creative Manager phù hợp                      |
| 6    | Creative Manager | Nhận task, có thể chia thành task nhỏ → assign cho Staff |
| 7    | Creative Staff   | Confirm → thực hiện → hoàn thành                         |
| 8    | Creative Head    | Review & đánh giá kết quả                                |

> 💡 Toàn bộ Creative Head đều nhận được thông báo — nếu có 2 CH thì cả 2 đều thấy task.

---

## B. Task thuộc Creative Department

**Bước 1 — PM tạo task & chuyển sang Creative**

- PM tạo task nhưng **KHÔNG fill brief**
- Chuyển thẳng sang Creative Department

**Bước 2 — Creative Head xử lý**

- Nhận task từ PM
- Fill đầy đủ thông tin brief
- Phân loại Task Level (1–4) theo 3 tiêu chí
- Assign cho Creative Manager phù hợp

**Bước 3 — Creative Manager phân công**

- Nhận task từ CH cùng brief đã hoàn tất
- **Không phân loại lại Task Level**
- Có thể chia 1 task lớn thành nhiều task nhỏ
- Assign từng task nhỏ cho Creative Staff

**Bước 4 — Creative Staff thực hiện**

- Confirm task trong vòng 15 phút
- Thực hiện → đánh dấu hoàn thành

**Bước 5 — Creative Head đánh giá**

- Review toàn bộ task nhỏ
- Approve hoặc yêu cầu revision

---

## So sánh hai loại task

|                         | Project Task (chuyển sang Creative) | Creative Task |
| ----------------------- | ----------------------------------- | ------------- |
| **PM fill brief?**      | ✅ Có                               | ❌ Không      |
| **CH fill brief?**      | ❌ Không cần                        | ✅ Có         |
| **CH phân loại Level?** | ❌ Không                            | ✅ Có         |
| **CM chia task nhỏ?**   | ✅ Có thể                           | ✅ Có thể     |

---

## View Permissions

| Role                     | Có thể xem                                           |
| ------------------------ | ---------------------------------------------------- |
| **Head (Project Dept.)** | Toàn bộ task Phòng Project + task nhỏ Phòng Creative |
| **PM**                   | Toàn bộ task Phòng Project (kể cả task PM tự assign) |
| **Creative Head**        | Toàn bộ task nhỏ Phòng Creative                      |

---

## Cảnh báo tự động

- Staff chưa confirm sau **15 phút** → cảnh báo PM (Project Staff) hoặc PM & CM (Creative Staff)
- PM tự assign → không cần confirm, tự động chuyển sang Đang làm
- Nhân viên không clock-in → không giao task được cho ngày đó
- Staff Overloaded hoặc nghỉ phép → không thể chọn khi assign

---

## B. Task thuộc Creative Department

**Bước 1 — PM tạo task & chuyển sang Creative**

- PM tạo task nhưng **KHÔNG fill brief**
- Chuyển thẳng sang Creative Department

**Bước 2 — Creative Head xử lý**

- Nhận task từ PM
- Fill đầy đủ thông tin brief
- Phân loại Task Level (1–4) theo 3 tiêu chí
- Assign cho Creative Manager phù hợp

**Bước 3 — Creative Manager phân công**

- Nhận task từ CH cùng brief đã hoàn tất
- **Không phân loại lại Task Level**
- Có thể chia 1 task lớn thành nhiều task nhỏ
- Assign từng task nhỏ cho Creative Staff

**Bước 4 — Creative Staff thực hiện**

- Confirm task trong vòng 15 phút
- Thực hiện → đánh dấu hoàn thành

**Bước 5 — Creative Head đánh giá**

- Review toàn bộ task nhỏ
- Approve hoặc yêu cầu revision

---

## So sánh hai loại task

|                         | Project Task (chuyển sang Creative) | Creative Task |
| ----------------------- | ----------------------------------- | ------------- |
| **PM fill brief?**      | ✅ Có                               | ❌ Không      |
| **CH fill brief?**      | ❌ Không cần                        | ✅ Có         |
| **CH phân loại Level?** | ❌ Không                            | ✅ Có         |
| **CM chia task nhỏ?**   | ✅ Có thể                           | ✅ Có thể     |

---

## View Permissions

| Role                     | Có thể xem                                           |
| ------------------------ | ---------------------------------------------------- |
| **Head (Project Dept.)** | Toàn bộ task Phòng Project + task nhỏ Phòng Creative |
| **PM**                   | Toàn bộ task Phòng Project                           |
| **Creative Head**        | Toàn bộ task nhỏ Phòng Creative                      |

---

## Cảnh báo tự động

- Staff chưa confirm sau **15 phút** → cảnh báo PM (Project Staff) hoặc PM & CM (Creative Staff)
- Nhân viên không clock-in → không giao task được cho ngày đó
- Staff Overloaded hoặc nghỉ phép → không thể chọn khi assign
