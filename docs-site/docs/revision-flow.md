---
sidebar_position: 3
sidebar_label: Luồng tạo revision
slug: /revision
---

# Luồng tạo revision

Hướng dẫn này mô tả cách yêu cầu làm lại một task trên Pokeslide: tạo revision, theo dõi, cập nhật trạng thái và đánh giá trên bản làm lại.

:::tip[Revision là gì?]

Revision **không** đổi trạng thái task gốc thành “cần sửa”. Hệ thống tạo một **task con riêng** (ví dụ mã `…-R1`) gắn dưới task gốc. Người nhận giữ nguyên. Staff làm và nộp trên task revision.

:::

---

## 1. Sơ đồ tổng quan

```text
Quản lý mở task gốc
      │
      ▼
Bấm "Yêu cầu revision"
      │
      ▼
Nhập lý do, số lượng, level,
ngày tính workload, deadline nộp lại
      │
      ▼
Bấm "Tạo revision"
      │
      ├── Task con mới: …-R1, R2, …
      ├── Người nhận = staff của task gốc
      ├── Status con: Chưa cập nhật
      │
      ▼
Trong lúc revision còn mở
(Chưa cập nhật / Đã confirm / Decline):
  • Không tạo thêm revision trên cùng task gốc
  • Task gốc khóa Update status, Edit, Evaluate
  → Làm việc trên task revision
      │
      ▼
Revision Finished hoặc Cancelled
      │
      ▼
Task gốc mở lại thao tác
Có thể tạo Revision tiếp theo nếu cần
```

---

## 2. Ai làm gì?

| Việc                                     | Ai làm được                                      |
| ---------------------------------------- | ------------------------------------------------ |
| Bấm **Yêu cầu revision** và tạo          | PM, Creative Manager, Creative Head, Head, Admin |
| Làm revision, confirm, đánh dấu Finished | Staff đang được giao trên task gốc               |
| Xem danh sách revision                   | Ai vào được chi tiết task (tab **Revision**)     |
| Không tạo revision                       | Staff / Employee                                 |

Quyền tạo revision gắn với quyền **đánh giá task** (`EVALUATE_TASK`).

---

## 3. Khi nào được tạo?

Chỉ tạo revision trên **task gốc** (hoặc task split), **không** tạo trên chính một revision.

| Điều kiện                    | Kết quả                                        |
| ---------------------------- | ---------------------------------------------- |
| Bạn có quyền đánh giá task   | Hiện nút **Yêu cầu revision**                  |
| Task đã có người nhận        | Được tạo                                       |
| Task chưa Finished           | Được tạo                                       |
| Task chưa Cancelled          | Được tạo                                       |
| Chưa có revision đang mở     | Được tạo                                       |
| Đang có revision chưa xong   | Nút bị khóa, phải đóng revision hiện tại trước |
| Đang đứng trên task revision | Không hiện nút tạo                             |

Revision được coi là **đang mở** khi trạng thái là **Chưa cập nhật**, **Đã confirm**, hoặc **Decline**.

Revision **Finished** hoặc **Cancelled** không còn chặn việc tạo round tiếp theo.

---

## 4. Vào đâu để tạo?

1. Mở **chi tiết task gốc** (Project Tasks, Creative queue, My Tasks…).
2. Ở thanh thao tác bên phải, bấm **Yêu cầu revision**.
3. Hệ thống mở form tạo revision.

Sau khi tạo, vào tab **Revision** trên task gốc để xem danh sách các lần làm lại và mở từng revision.

---

## 5. Điền form tạo revision

Form hiện sẵn thông tin task gốc (mã, project, người nhận, số lượng gốc, level gốc, deadline gốc…). Bạn **không** đổi người nhận trong bước này.

**Cần nhập:**

| Trường                 | Gợi ý                                                          |
| ---------------------- | -------------------------------------------------------------- |
| **Lý do revision**     | Mô tả phần cần sửa hoặc feedback (bắt buộc)                    |
| **Số lượng làm lại**   | Có thể ít hơn, bằng, hoặc nhiều hơn gốc. Chỉ cần lớn hơn 0     |
| **Level revision**     | Chọn Level 1 đến 4 (mặc định gần level gốc)                    |
| **Ngày tính workload** | Ngày capacity tính cho lần làm lại (độc lập với ngày task gốc) |
| **Deadline nộp lại**   | Hạn nộp revision. Phải từ ngày tính workload trở đi            |

:::note[Số lượng nhiều hơn gốc]

Nếu số lượng revision lớn hơn task gốc, workload và capacity của lần làm lại sẽ cao hơn. Hệ thống cảnh báo trên form.

:::

**Chưa hỗ trợ:** giao revision cho người khác. Người nhận luôn giữ nguyên như task gốc.

Khi xong, bấm **Tạo revision**.

---

## 6. Sau khi tạo: làm việc thế nào?

### Trên task gốc

Khi còn revision đang mở:

- **Update status**, **Edit task**, **Evaluate** trên task gốc bị khóa
- Hệ thống nhắc: cập nhật trên revision (có thể mở tab **Revision**)
- Badge kiểu **Đang revision** / **Có revision** hiện trên danh sách và chi tiết

### Trên task revision

- Staff nhận thông báo như được giao task mới
- Confirm, làm việc, cập nhật trạng thái, Finished trên **task revision**
- Quản lý đánh giá trên **task revision** (không đánh giá trên gốc khi còn revision mở)
- Tab Revision của chính task con có link về task gốc

### Khi revision xong

- Revision **Finished** hoặc **Cancelled** → task gốc mở lại Update / Edit / Evaluate
- Có thể bấm **Yêu cầu revision** lần nữa để tạo `…-R2`, `…-R3`, …

:::warning[Chỉ một revision mở tại một thời điểm]

Mỗi task gốc chỉ được mở **một** revision chưa hoàn tất. Xong round hiện tại rồi mới tạo round kế tiếp.

:::

---

## 7. Revision và capacity

- Workload của revision tính theo **số lượng** và **level** của revision, theo **ngày tính workload** đã chọn.
- Revision **Cancelled** không tính vào capacity.
- Revision vẫn đang mở hoặc đã Finished vẫn tham gia workload theo quy tắc capacity chung.

---

## 8. Quy tắc cần nhớ

- Revision = **task con mới**, không phải đổi status task gốc.
- Người nhận **giữ nguyên**; chưa đổi assignee trên form tạo.
- Không tạo revision khi task gốc đã Finished hoặc Cancelled.
- Không tạo revision trên một revision.
- Đang có revision mở → khóa thao tác chính trên task gốc.
- Số lượng làm lại linh hoạt (ít hơn / bằng / nhiều hơn gốc), miễn lớn hơn 0.
- Deadline nộp lại không được trước ngày tính workload.

---

## 9. Tóm tắt nhanh

1. Mở task gốc → **Yêu cầu revision**.
2. Nhập lý do, số lượng, level, ngày workload, deadline → **Tạo revision**.
3. Staff làm trên task `…-Rn`; cập nhật và đánh giá trên revision.
4. Task gốc tạm khóa Update / Edit / Evaluate đến khi revision đóng.
5. Finished hoặc Cancelled revision → gốc mở lại; có thể tạo round tiếp theo.
