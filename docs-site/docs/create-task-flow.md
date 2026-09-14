---
sidebar_position: 1
sidebar_label: Tạo task
slug: /
---

# Tạo task mới (PM)

Hướng dẫn này mô tả cách **PM tạo task mới** trên Pokeslide: nhập thông tin brief, phân loại độ khó và chọn hướng giao việc (Phòng Project hoặc Phòng Creative).

---

## 1. Sơ đồ tổng quan

```text
                    PM tạo task
                         │
           ┌─────────────┴─────────────┐
           │                           │
    Project Task                 Creative Task
    (PM viết brief + Level)      (chưa có brief)
           │                           │
     ┌─────┴─────┐                     │
     │           │                     │
 Phòng      Phòng Creative              │
 Project    (kèm brief)                 │
     │           │                     │
     │           └──────────┬──────────┘
     │                      │
     ▼                      ▼
 Project Staff         Creative Head
 (confirm)             (brief/Level nếu cần)
     │                      │
     ▼                      ▼
   Làm việc            Creative Manager
     │                 (giao / chia nhỏ)
     ▼                      │
 Đánh giá                   ▼
 (PM / quản lý)       Creative Staff
                            │
                            ▼
                      Đánh giá
                      (CH / CM / PM…)
```

---

## 2. Ví dụ

PM tạo task thiết kế slide Q3, chuyển sang Creative. Creative Head giao CM, CM chia thành 3 phần cho 3 designer.

---

## 3. Ai được tạo task?

Chỉ **Project Manager (PM)** và **Admin** có quyền tạo task.

| Vai trò                                      | Tạo task? |
| -------------------------------------------- | --------- |
| PM / Admin                                   | Có        |
| Head, Creative Head, Creative Manager, Staff | Không     |

Mọi task trong hệ thống đều **bắt đầu từ PM**, kể cả task sau này do Creative xử lý.

---

## 4. Vào đâu để tạo task?

PM mở **Task management → Project Tasks** (hoặc tab **Tasks** trong chi tiết dự án), bấm **Tạo task**.

Hệ thống mở drawer **“Tạo task mới”** bên phải màn hình.

---

## 5. Chọn loại task (bước đầu)

PM chọn một trong hai loại:

### A. Project Task

- PM **viết brief** và **phân loại độ khó (Level 1 đến 4)**.
- Sau đó chọn giao cho **Phòng Project** hoặc **chuyển sang Phòng Creative**.

### B. Creative Task

- PM **không cần viết brief** lúc tạo.
- Task chuyển thẳng cho **Creative Head (CH)**.
- CH sẽ bổ sung brief, phân loại Level và giao **Creative Manager (CM)**.

---

## 6. Luồng chi tiết

### 6.1. Project Task: 3 bước

#### Bước 1: Brief

PM nhập:

| Trường           | Mô tả                                      |
| ---------------- | ------------------------------------------ |
| Tên dự án        | Chọn hoặc nhập tên dự án                   |
| PM               | Người quản lý dự án                        |
| Tên task         | Chọn từ danh mục task (catalog)            |
| Số lượng         | Số slide / đơn vị công việc                |
| Deadline         | Ngày và giờ hoàn thành                     |
| Urgency          | Mức ưu tiên (có thể để Auto theo deadline) |
| Brief            | Mô tả công việc, yêu cầu kỹ thuật          |
| Phân loại độ khó | 3 tiêu chí, mỗi tiêu chí chọn mức 1 đến 4  |

**3 tiêu chí phân loại:**

1. **Tư duy thiết kế**
2. **Kỹ thuật**
3. **Xử lý nội dung**

Hệ thống tự tính **Level task (1 đến 4)** từ trung bình 3 tiêu chí.

#### Bước 2: Hướng giao

PM chọn một trong hai hướng:

**Hướng 1: Phòng Project**

- Giao trực tiếp cho **Project Staff**.
- Chọn người nhận (có hiển thị trạng thái workload).
- Brief và Level đã nhập ở bước 1 đi kèm task.
- Staff được nhắc **confirm** sau khi nhận (UI hiện thông báo khung thời gian 15 phút; chưa có timer tự khóa).

**Hướng 2: Phòng Creative**

- Chuyển task sang Creative **kèm brief đã viết**.
- **Không** chọn Staff lúc này.
- Mọi **Creative Head** nhận thông báo.
- CH vào **Creative queue** để giao CM (không cần viết lại brief).
- Ai giao CM trước sẽ khóa task cho CM đó.

#### Bước 3: Xác nhận

PM xem lại tóm tắt: loại task, dự án, PM, tên task, brief, Level, số lượng, deadline, hướng giao.

- Giao Project Staff → bấm **“Giao task”**
- Chuyển Creative → bấm **“Gửi Creative”**

---

### 6.2. Creative Task: 3 bước trên UI

UI drawer hiện **3 bước**: **Tạo task** → thông tin chuyển Creative → **Hoàn tất**.

#### Bước 1: Tạo task

PM nhập:

- Tên dự án, PM, tên task (catalog)
- Deadline, Urgency

**Không** nhập brief, **không** nhập số lượng và **không** phân loại Level.

#### Bước 2: Thông tin chuyển Creative

Hệ thống nhắc: chưa cần brief; CH sẽ bổ sung brief, phân loại Level và giao CM. Mọi CH nhận thông báo.

#### Bước 3: Hoàn tất

PM xem lại tóm tắt và bấm **“Gửi Creative”**.

Task vào hàng chờ Creative; CH nhận thông báo và xử lý tiếp.

---

## 7. Sau khi PM tạo xong: ai làm gì?

### Trường hợp giao Project Staff

```text
PM tạo task → Project Staff nhận → Confirm → Làm việc → Hoàn thành → Đánh giá (PM / quản lý)
```

### Trường hợp chuyển Creative (từ Project Task hoặc Creative Task)

**Nếu PM đã viết brief (Project Task chuyển Creative):**

```text
PM → Creative Head (brief sẵn) → giao CM → CM giao Staff → Staff làm → Đánh giá
```

**Nếu PM chưa viết brief (Creative Task):**

```text
PM → Creative Head (bổ sung brief + Level) → giao CM → CM giao Staff → Staff làm → Đánh giá
```

### Creative Head: Creative queue

- Vào **Task management → Creative queue**
- Task thiếu brief: **“Bổ sung brief & giao CM”** (nút lưu: **“Lưu & giao CM”**)
- Task đủ brief: **“Giao cho CM”**
- **Chỉ khi task thiếu brief**, CH được chỉnh **deadline Creative** và **urgency**
- Có thể thêm ghi chú cho CM

### Creative Manager: Creative queue

- Nhận task từ CH
- **Giao nguyên** cho một Staff, hoặc **chia nhỏ** thành nhiều task con (mỗi phần có brief riêng)
- **Không** phân loại lại Level (chỉ Admin / CH được đổi Level, và trước khi Staff confirm)

### PM / Admin trên Creative queue

PM và Admin cũng vào được **Creative queue**, có thể **theo dõi và xử lý assign** như CH/CM (không chỉ xem).

### Đánh giá sau khi hoàn thành

Người có quyền đánh giá task gồm **PM, Creative Head, Creative Manager, Head, Admin** — không chỉ riêng CH.

---

## 8. So sánh nhanh hai loại task

|                                                   | Project Task                | Creative Task       |
| ------------------------------------------------- | --------------------------- | ------------------- |
| PM viết brief?                                    | Có                          | Không               |
| PM phân loại Level?                               | Có                          | Không               |
| PM nhập số lượng?                                 | Có                          | Không               |
| Hướng giao sau khi tạo                            | Project Staff hoặc Creative | Luôn sang Creative  |
| CH cần viết brief?                                | Không (nếu PM đã viết)      | Có                  |
| CH phân loại Level?                               | Không (PM đã phân loại)     | Có                  |
| CH chỉnh deadline Creative / urgency khi giao CM? | Không (brief đã sẵn)        | Có (vì thiếu brief) |
| CM có thể chia task nhỏ?                          | Có                          | Có                  |

---

## 9. Quy tắc hệ thống cần biết

### Khi giao người nhận

- Không chọn Staff **Overloaded** hoặc **đang nghỉ phép**
- Hệ thống hiển thị trạng thái workload khi chọn người
- Capacity ≥ **80%** được coi là Overloaded và không chọn được (áp dụng khi giao Project Staff lẫn Creative)

### Thông báo

- Giao Project Staff → Staff nhận thông báo
- Chuyển Creative → **tất cả Creative Head** nhận thông báo
- CH giao CM → CM nhận thông báo

### Xác nhận task

- Sau khi được giao, Staff cần **confirm** (UI nhắc khung 15 phút; hiện chưa có timer tự động khóa task)
- Task còn **chưa cập nhật (not_updated)** xuất hiện trên hàng chờ hành động của quản lý (Home); quản lý có thể **remind** thủ công
- Chưa có cảnh báo tự động riêng theo đúng mốc 15 phút cho PM/CM

### Đóng form giữa chừng

- Nếu đã nhập dữ liệu mà đóng drawer, hệ thống hỏi xác nhận hủy. Dữ liệu chưa lưu sẽ mất.
