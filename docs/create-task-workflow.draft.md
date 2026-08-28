---
sidebar_position: 1
sidebar_label: Luồng tạo task
---

# Luồng tạo task

Tài liệu này mô tả luồng tạo và giao task theo hai nhánh: **Project Department** và **Creative Department**.

Chỉ **PM** (và Admin) có quyền tạo task. Mọi task đều bắt đầu từ PM.

---

## A. Task thuộc Project Department

### 1. PM tạo task và fill brief

PM tạo task, đồng thời **fill đầy đủ thông tin brief**, gồm:

- Thông tin dự án, tên task, deadline, urgency
- Mô tả công việc (brief)
- Phân loại độ khó theo 3 tiêu chí → hệ thống tính **Task Level (1 đến 4)**

### 2. Sau khi hoàn tất brief, PM chọn một trong hai hướng

**Hướng 1: Assign trực tiếp cho Project Staff**

- PM chọn Project Staff nhận task
- Brief và Level đã nhập ở bước 1 đi kèm task
- Project Staff nhận task và thực hiện

**Hướng 2: Chuyển task sang Creative Department**

- PM chuyển task sang phòng Creative **kèm brief đã hoàn tất**
- PM **không** chọn Staff lúc này
- Task vào hàng chờ Creative để Creative Head xử lý tiếp (xem mục 3)

### 3. Nếu PM chuyển task sang Creative Department

- **Toàn bộ Creative Head** nhận được thông tin task. Ví dụ: nếu có 2 Creative Head thì cả 2 đều nhìn thấy task trong **Creative queue**.
- Creative Head **không cần fill lại brief**, vì brief đã được PM hoàn tất.
- Creative Head **chỉ thực hiện việc assign task cho Creative Manager**.

Sau khi Creative Manager nhận task, CM có thể giao nguyên cho Staff hoặc chia nhỏ task thành nhiều phần (xem phần B, mục 3).

---

## B. Task thuộc Creative Department

### 1. PM tạo task và chuyển sang Creative

PM tạo task và **chuyển trực tiếp sang Creative Department**, nhưng **không fill thông tin brief** của Creative task.

Task vào hàng chờ Creative. Toàn bộ Creative Head nhận thông báo.

### 2. Creative Head xử lý

Creative Head sẽ:

1. **Nhận task từ PM**
2. **Fill các thông tin brief** cần thiết
3. **Phân loại Task Level**
4. **Assign task cho Creative Manager**

### 3. Creative Manager phân công

Creative Manager sẽ:

1. **Nhận task từ Creative Head** cùng với brief đã được hoàn tất
2. **Không phân loại lại Task Level**
3. **Có thể chia nhỏ task** thành nhiều task nhỏ để assign cho **Creative Staff**

Creative Staff nhận task, thực hiện và hoàn thành theo quy trình nội bộ phòng Creative.

---

## So sánh hai nhánh

|                                 | A. Project Department                       | B. Creative Department |
| ------------------------------- | ------------------------------------------- | ---------------------- |
| PM fill brief?                  | Có                                          | Không                  |
| PM phân loại Level?             | Có                                          | Không                  |
| Sau khi PM tạo                  | Giao Project Staff **hoặc** chuyển Creative | Luôn chuyển Creative   |
| Creative Head fill brief?       | Không (PM đã fill)                          | Có                     |
| Creative Head phân loại Level?  | Không (PM đã phân loại)                     | Có                     |
| Creative Head assign CM?        | Có (khi chuyển Creative)                    | Có                     |
| Creative Manager chia task nhỏ? | Có thể                                      | Có thể                 |

---

## Sơ đồ tổng quan

```text
                         PM tạo task
                              │
              ┌───────────────┴───────────────┐
              │                               │
     A. Project Department          B. Creative Department
     (PM fill brief + Level)         (PM chưa fill brief)
              │                               │
     ┌────────┴────────┐                      │
     │                 │                      │
 Project Staff    Creative Dept                │
     │                 │                      │
     │                 └──────────┬───────────┘
     │                            │
     ▼                            ▼
  Thực hiện                 Creative Head
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              Brief sẵn (A)            Fill brief + Level (B)
                    │                         │
                    └────────────┬────────────┘
                                 ▼
                          Creative Manager
                                 │
                                 ▼
                          Creative Staff
```
