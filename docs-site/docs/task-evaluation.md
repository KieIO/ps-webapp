---
sidebar_position: 4
sidebar_label: Đánh giá task (Evaluation)
slug: /tasks/evaluation
---

# Đánh giá task (tab Evaluation)

Nhãn trên tab **Evaluation** / modal **Evaluate** theo mẫu **`Đánh giá [đối tượng] (bởi [người chấm])`**.

Liên quan: [Tạo task](/create-task) · [Chia task con](/split-task) · [Trạng thái Task](/tasks/status)

---

## 1. Ba lớp đánh giá Creative

Thứ tự handoff: **PM → Creative Head → CM → Staff**.

| Nhãn UI                                   | Ai chấm          | Đối tượng       |
| ----------------------------------------- | ---------------- | --------------- |
| **Đánh giá Creative Head (bởi PM)**       | PM               | Creative Head   |
| **Đánh giá gói CM (bởi Creative Head)**   | Creative Head    | Gói giao cho CM |
| **Đánh giá Staff (bởi Creative Manager)** | Creative Manager | Kết quả Staff   |

**Creative Head — cửa sổ Evaluate:** sau khi CM đã chia task con — trên **task cha đã chia** (handoff). Không Evaluate khi còn `awaiting_cm`; không ghi điểm Staff (CM chấm từng task con).

**Modal Evaluate (Staff / gói CM / CH):** nhập **Số lượng đạt** → hệ thống tự tính **% hoàn thành** và hiện **Tóm tắt** (`Đạt x / y · Còn z`). Tách phần còn lại (remainder) chỉ có ở lớp **Đánh giá Staff**.

**Quyền trên chi tiết task / project:** mọi role liên quan **xem** được điểm đã chấm trên tab Evaluation. Nút **Evaluate** theo lớp: CM → Staff; Creative Head / Head → gói CM; PM → Creative Head (sau CH đã giao CM). PM **không** chấm gói CM / Staff.

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
4. Evaluate: **SL đạt → % tự tính + tóm tắt**; tách remainder chỉ lớp Staff.
