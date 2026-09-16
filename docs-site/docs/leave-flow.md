---
sidebar_position: 1
sidebar_label: Luồng nghỉ phép
slug: /leave
---

# Luồng nghỉ phép

Hướng dẫn này mô tả cách lên lịch nghỉ phép cho nhân viên, bàn giao task, hủy nghỉ, và kích hoạt lại tài khoản trên Pokeslide.

:::tip Điểm quan trọng
Khi xác nhận nghỉ phép, nhân viên **được đánh dấu On leave ngay**, kể cả khi ngày bắt đầu còn ở tương lai. Sau khi hết ngày nghỉ, Admin phải **Activate** thủ công để nhân viên nhận task trở lại.
:::

---

## 1. Sơ đồ tổng quan

```text
Quản lý mở lên lịch nghỉ
(Users → Leave, hoặc User detail)
      │
      ▼
Chọn khoảng ngày + lý do (tuỳ chọn)
      │
      ▼
Xem task bị ảnh hưởng trong kỳ nghỉ
Chọn người thay (có thể bỏ trống)
      │
      ▼
Xác nhận nghỉ phép
      │
      ├── Nhân viên → On leave ngay
      ├── Task: gỡ người nghỉ, gắn người thay nếu đã chọn
      │
      ▼
Trong kỳ nghỉ: không giao task mới cho người này
      │
      ├── Hủy sớm (còn trong kỳ) → Active ngay
      │     (task đã bàn giao không tự hoàn nguyên)
      │
      └── Hết ngày nghỉ
            │
            ▼
      Bản ghi leave → Ended
      Nhân viên vẫn On leave
            │
            ▼
      Admin Activate employee
            │
            ▼
      Nhân viên → Active
      Có thể nhận task trở lại
```

---

## 2. Ai làm gì?

| Việc                                | Ai làm được                                                  |
| ----------------------------------- | ------------------------------------------------------------ |
| Lên lịch nghỉ phép                  | PM, Creative Manager, Creative Head, Head, Admin             |
| Xem preview task và chọn người thay | Cùng nhóm có quyền lên lịch nghỉ                             |
| Hủy nghỉ đang còn hiệu lực          | Cùng nhóm có quyền lên lịch nghỉ                             |
| Activate lại sau khi hết nghỉ       | **Chỉ Admin**                                                |
| Xem lịch sử nghỉ trên hồ sơ         | Chính nhân viên đó, hoặc người có quyền quản lý user / leave |

**Phạm vi theo phòng ban**

| Vai trò                             | Được lên lịch nghỉ cho           |
| ----------------------------------- | -------------------------------- |
| Admin, Head                         | Mọi nhân viên                    |
| PM, Creative Manager, Creative Head | Chỉ nhân viên **cùng phòng ban** |

Staff / Employee **không** tự lên lịch nghỉ trên hệ thống. Sale cũng không có quyền này.

---

## 3. Các trạng thái

### Trạng thái nhân viên (Users)

| Trạng thái UI | Ý nghĩa trong luồng nghỉ                                   |
| ------------- | ---------------------------------------------------------- |
| **Active**    | Đang làm việc, có thể nhận task                            |
| **On leave**  | Đang trong (hoặc vừa hết) kỳ nghỉ; **không** giao task mới |
| **Inactive**  | Không liên quan leave flow; không lên lịch nghỉ được       |
| **Invited**   | Chưa kích hoạt tài khoản; không lên lịch nghỉ được         |

### Trạng thái bản ghi nghỉ (`leave`)

| Trạng thái    | Khi nào                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| **Active**    | Đã lên lịch, kỳ nghỉ còn hiệu lực (chưa hủy, chưa qua ngày kết thúc theo hệ thống) |
| **Ended**     | Đã qua ngày kết thúc; chờ Admin Activate                                           |
| **Cancelled** | Quản lý hủy nghỉ sớm; nhân viên về Active                                          |

---

## 4. Vào đâu để lên lịch?

Có **hai lối vào**, cùng một wizard:

1. **Users** → hàng nhân viên đang Active → nút **Leave**
2. **User detail** → phần **Leave** → **Schedule leave**

:::note Status “On leave” trên form hồ sơ
Dropdown **Status → On leave** trên User detail **không** lưu thẳng trạng thái. Hệ thống mở cùng wizard lên lịch nghỉ. Muốn đưa người đang On leave về Active, dùng **Activate employee** (Admin) hoặc **Cancel leave** (nếu còn trong kỳ), không Save Status tay.
:::

---

## 5. Chi tiết từng bước

### Bước 1: Chọn ngày nghỉ

**Ai:** người có quyền lên lịch nghỉ (đúng phạm vi phòng ban)

**Cần nhập:**

- Ngày bắt đầu
- Ngày kết thúc (phải từ ngày bắt đầu trở đi)
- Lý do (tuỳ chọn)

**Điều kiện:**

- Nhân viên đang Active (không phải Inactive / Invited)
- Không chồng lên một kỳ nghỉ Active khác

### Bước 2: Task bị ảnh hưởng và bàn giao

Hệ thống liệt kê các task mà nhân viên đang gắn, có ngày nằm trong kỳ nghỉ, và confirmation còn **Confirmed** hoặc **Not updated**.

Với mỗi task, quản lý có thể:

- Chọn **người thay** (cùng phòng ban phù hợp, đang Active, không Off / On leave ngày đó)
- Hoặc để trống: người nghỉ bị gỡ khỏi task; task có thể còn người khác hoặc thiếu người nhận

Danh sách người thay hiện kèm % capacity để chọn người còn tải hợp lý.

### Bước 3: Xác nhận

Tóm tắt: nhân viên, khoảng ngày, lý do, số task đã chọn người thay.

Sau **Confirm leave**:

- Tạo bản ghi nghỉ **Active**
- Nhân viên chuyển **On leave ngay**
- Áp dụng bàn giao task đã chọn
- Ghi audit

---

## 6. Trong thời gian On leave

| Hành động                       | Hệ thống xử lý thế nào                                         |
| ------------------------------- | -------------------------------------------------------------- |
| Giao / đổi staff trên task      | **Không** chọn được người On leave                             |
| Capacity / Create task          | Hiện trạng thái nghỉ phép; không assign                        |
| Project Tracker                 | Tên người On leave / Inactive có thể xuất hiện ở danh sách Off |
| Đổi Status tay trên User detail | Không dùng để thoát On leave                                   |

---

## 7. Hủy nghỉ sớm

**Điều kiện:** bản ghi nghỉ còn **Active** và chưa qua ngày kết thúc.

**Ai:** người có quyền lên lịch nghỉ (đúng phạm vi phòng ban).

**Sau khi hủy:**

- Bản ghi nghỉ → **Cancelled**
- Nhân viên → **Active** ngay
- Task đã bàn giao lúc lên lịch **không** tự trả về người cũ (cần chỉnh tay nếu muốn hoàn nguyên)

---

## 8. Hết ngày nghỉ và Activate

1. Khi đã qua ngày kết thúc, hệ thống đánh dấu bản ghi nghỉ **Ended** (khi có người gọi API leave liên quan; chưa có job chạy nửa đêm riêng).
2. Nhân viên **vẫn On leave** cho đến khi Admin kích hoạt lại.
3. Admin thấy banner **pending reactivation** trên Dashboard, Users, Tracker, hoặc nút **Activate employee** ở User detail.
4. Sau Activate: nhân viên → **Active**, có thể nhận task trở lại.

:::warning Chỉ Admin Activate
PM / CM / Creative Head **không** Activate sau khi hết nghỉ. Họ chỉ Cancel khi kỳ nghỉ còn đang diễn ra.
:::

---

## 9. Quy tắc cần nhớ

- Lên lịch xong → On leave **ngay**, không chờ đến ngày bắt đầu.
- Hết ngày nghỉ ≠ tự Active. Cần Admin **Activate**.
- Không giao task cho người Overloaded hoặc đang nghỉ phép (áp dụng khi tạo / gán task).
- Hủy nghỉ không hoàn nguyên bàn giao task.
- Không chồng hai kỳ nghỉ Active trên cùng một người.
- Admin / Head quản lý mọi phòng; PM / CM / Creative Head chỉ cùng phòng.

---

## 10. Tóm tắt nhanh

1. Quản lý mở **Leave** / **Schedule leave**, chọn ngày (và lý do nếu cần).
2. Xem task trong kỳ nghỉ, chọn người thay hoặc để trống.
3. Confirm → nhân viên **On leave ngay**, task được bàn giao theo lựa chọn.
4. Còn trong kỳ: có thể **Cancel leave** → Active ngay (không rollback task).
5. Hết ngày: leave **Ended**, Admin **Activate** → Active, nhận task trở lại.
