---
sidebar_position: 4
sidebar_label: Đánh giá task (Evaluation)
slug: /tasks/evaluation
---

# Đánh giá task (tab Evaluation)

Nhãn trên tab **Evaluation** / modal **Evaluate** theo mẫu **`Đánh giá [đối tượng] (bởi [người chấm])`**.

Liên quan: [Tạo task](/create-task) · [Chia task con](/split-task) · [Trạng thái Task](/tasks/status)

---

## 1. Ba lớp đánh giá Creative (giao nguyên)

Thứ tự handoff: **PM → Creative Head → CM → Staff**.

| Nhãn UI                                   | Ai chấm          | Đối tượng       |
| ----------------------------------------- | ---------------- | --------------- |
| **Đánh giá Creative Head (bởi PM)**       | PM               | Creative Head   |
| **Đánh giá gói CM (bởi Creative Head)**   | Creative Head    | Gói giao cho CM |
| **Đánh giá Staff (bởi Creative Manager)** | Creative Manager | Kết quả Staff   |

**Creative Head — cửa sổ Evaluate:** chỉ **task giao nguyên** sau khi CM đã giao Staff. Không Evaluate khi còn `awaiting_cm`; không ghi điểm vào ô Staff. (Task cha đã chia: tạm chưa mở lớp gói CM — hỏi lại sau.)

Code: `EVALUATION_LAYER_TITLES` trong `taskEvaluation.ts` (tab chi tiết + modal Evaluate + tooltip list).

### Badge trên list (Project Tasks)

| Badge            | Tooltip (= nhãn trên)                 |
| ---------------- | ------------------------------------- |
| **Đã ĐG CH**     | Đánh giá Creative Head (bởi PM)       |
| **Đã ĐG gói CM** | Đánh giá gói CM (bởi Creative Head)   |
| **Đã ĐG Staff**  | Đánh giá Staff (bởi Creative Manager) |

(Sau spawn remainder, badge Staff có thể hiện `Đạt x/y` thay vì `Đã ĐG Staff`.)

---

## 2. Tab Details — không hiện note đánh giá

Note từng lớp (`chNote` / `handoffNote` / `pmNote`) chỉ hiện ở **tab Evaluation**.

Tab **Details & description** **không** còn alert «Note from PM» (trước đây lấy `pmNote` — thực ra là note đánh giá Staff bởi CM, dễ hiểu nhầm).

Trên Details vẫn có:

- **Task description** (brief)
- **Ghi chú** (`staffNote` — ghi chú khi làm việc / đổi status)
- **Additional factors** (nếu có)

---

## 3. Tóm tắt

1. Cùng một mẫu nhãn: đối tượng trước, người chấm trong ngoặc `(bởi …)`.
2. List badge ngắn (`Đã ĐG …`); tooltip = nhãn tab Evaluation.
3. Note đánh giá → tab Evaluation; không gắn lên Details như «Note from PM».
