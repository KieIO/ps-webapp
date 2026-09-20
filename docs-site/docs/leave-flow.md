---
sidebar_position: 1
sidebar_label: Luồng nghỉ phép
slug: /leave
---

# Luồng nghỉ phép

Trang này hướng dẫn quản lý **lên lịch nghỉ phép** cho nhân viên trên Pokeslide: chọn ngày, bàn giao task, và đưa người đó đi làm lại khi hết nghỉ hoặc hủy sớm.

## Đọc trước 30 giây

Trên hệ thống, nghỉ phép **không** chỉ là “đánh dấu lịch”. Khi bạn **xác nhận nghỉ**:

1. Nhân viên chuyển **On leave ngay** — kể cả ngày bắt đầu còn ở tương lai
2. Task trong kỳ nghỉ được bàn giao theo lựa chọn của bạn
3. Hệ thống **không** giao task mới cho người đang On leave

Có **hai cách** đưa nhân viên về làm việc (**Active**):

| Tình huống                                     | Cách làm                        | Ai làm                       |
| ---------------------------------------------- | ------------------------------- | ---------------------------- |
| Cần đi làm **trước** ngày kết thúc đã lên lịch | **Hủy nghỉ sớm** (Cancel leave) | Người có quyền lên lịch nghỉ |
| Kỳ nghỉ **đã hết đúng hạn**                    | **Activate employee**           | **Chỉ Admin**                |

:::tip[Hay nhầm nhất]

Hết ngày nghỉ **không** tự Active. Admin phải bấm **Activate**, nếu không nhân viên vẫn On leave và không nhận task mới.

:::

---

## 1. Luồng tổng quan

```text
Quản lý mở lên lịch nghỉ
      │
      ▼
Chọn ngày (+ lý do, tuỳ chọn)
      │
      ▼
Xem task trong kỳ nghỉ → chọn người thay (hoặc để trống)
      │
      ▼
Xác nhận (Confirm leave)
      │
      ├── Nhân viên: On leave ngay
      └── Task: bàn giao theo lựa chọn
      │
      ▼
Trong kỳ nghỉ: không giao task mới cho người này
      │
      ├── Hủy sớm ──────────────► Active ngay
      │                          (task đã bàn giao không tự đổi lại)
      │
      └── Hết ngày nghỉ đúng hạn
                │
                ▼
          Nhân viên vẫn On leave
                │
                ▼
          Admin Activate employee
                │
                ▼
          Active — nhận task trở lại
```

---

## 2. Ai được làm gì?

| Việc                                     | Ai làm được                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| Lên lịch nghỉ, xem task, chọn người thay | PM, Creative Manager, Creative Head, Head, Admin             |
| Hủy nghỉ sớm (còn trong kỳ)              | Cùng nhóm trên                                               |
| Activate sau khi hết nghỉ                | **Chỉ Admin**                                                |
| Xem lịch sử nghỉ trên hồ sơ              | Chính nhân viên đó, hoặc người có quyền quản lý user / leave |

**Phạm vi phòng ban**

| Vai trò                             | Được lên lịch / hủy nghỉ cho     |
| ----------------------------------- | -------------------------------- |
| Admin, Head                         | Mọi nhân viên                    |
| PM, Creative Manager, Creative Head | Chỉ nhân viên **cùng phòng ban** |

Nhân viên (Employee) và Sale **không** tự lên lịch nghỉ trên hệ thống.

---

## 3. Các trạng thái cần biết

Có hai lớp trạng thái — đừng nhầm với nhau.

### Nhân viên (trên Users)

| Trạng thái                 | Ý nghĩa với nghỉ phép                                                |
| -------------------------- | -------------------------------------------------------------------- |
| **Active**                 | Đang làm việc, có thể nhận task; mới lên lịch nghỉ được              |
| **On leave**               | Đang nghỉ (hoặc vừa hết nghỉ chưa Activate); **không** giao task mới |
| **Inactive** / **Invited** | Không lên lịch nghỉ được                                             |

### Kỳ nghỉ (lịch sử leave)

| Trạng thái    | Ý nghĩa                                   |
| ------------- | ----------------------------------------- |
| **Active**    | Kỳ nghỉ đang hiệu lực                     |
| **Cancelled** | Đã hủy sớm → nhân viên về Active          |
| **Ended**     | Đã qua ngày kết thúc → chờ Admin Activate |

---

## 4. Vào đâu để lên lịch?

Hai lối vào, cùng một wizard:

1. **Users** → chọn nhân viên đang **Active** → nút **Leave**
2. **User detail** → phần **Leave** → **Schedule leave**

:::note[Đừng đổi Status tay thành On leave]

Dropdown **Status → On leave** trên User detail **không** lưu thẳng. Hệ thống sẽ mở wizard lên lịch nghỉ.  
Muốn đưa người đang On leave về Active: dùng **Cancel leave** (còn trong kỳ) hoặc **Activate employee** (Admin, sau khi hết hạn) — không Save Status tay.

:::

---

## 5. Lên lịch nghỉ — từng bước

### Bước 1: Chọn ngày

**Ai:** người có quyền lên lịch (đúng phạm vi phòng ban, mục 2)

**Nhập:**

- Ngày bắt đầu
- Ngày kết thúc (từ ngày bắt đầu trở đi)
- Lý do (tuỳ chọn)

**Điều kiện:**

- Nhân viên đang **Active**
- Không chồng lên một kỳ nghỉ đang hiệu lực khác

### Bước 2: Bàn giao task trong kỳ nghỉ

Hệ thống liệt kê task mà nhân viên đang gắn, có ngày nằm trong kỳ nghỉ, và confirmation còn **Confirmed** hoặc **Not updated**.

Với mỗi task bạn có thể:

- Chọn **người thay** — cùng phòng phù hợp, đang Active, không Off / On leave ngày đó (danh sách có % capacity để chọn người còn tải)
- **Để trống** — người nghỉ bị gỡ khỏi task; task có thể còn người khác hoặc tạm thiếu người nhận

### Bước 3: Xác nhận

Màn hình tóm tắt nhân viên, khoảng ngày, lý do, số task đã chọn người thay.

Sau **Confirm leave**:

- Nhân viên chuyển **On leave ngay**
- Task được bàn giao theo lựa chọn ở bước 2
- Kỳ nghỉ được lưu với trạng thái đang hiệu lực

---

## 6. Trong thời gian On leave

| Việc bạn thử làm                | Hệ thống xử lý                                               |
| ------------------------------- | ------------------------------------------------------------ |
| Giao / đổi staff trên task      | **Không** chọn được người đang On leave                      |
| Capacity / Create task          | Hiện đang nghỉ phép; không assign                            |
| Project Tracker                 | Tên người On leave / Inactive có thể nằm trong danh sách Off |
| Đổi Status tay trên User detail | **Không** thoát được On leave bằng cách này                  |

---

## 7. Hủy nghỉ sớm

Dùng khi nhân viên **đang trong kỳ nghỉ** nhưng cần đi làm lại **trước** ngày kết thúc đã lên lịch.

**Khi nào hủy được:** kỳ nghỉ còn hiệu lực (chưa hết ngày kết thúc, chưa hủy trước đó).

**Ai hủy được:** cùng nhóm có quyền lên lịch nghỉ, đúng phạm vi phòng ban (mục 2).

**Sau khi hủy:**

1. Nhân viên về **Active ngay** — nhận task trở lại được
2. Kỳ nghỉ đánh dấu đã hủy (**Cancelled**)
3. Task đã chuyển cho người khác lúc lên lịch **không đổi lại tự động**. Muốn người cũ nhận lại → chỉnh tay từng task

:::tip[Hủy sớm ≠ hết ngày nghỉ]

Hủy sớm → Active **ngay**, không cần Admin.  
Hết hạn đúng lịch → vẫn On leave đến khi Admin **Activate** (mục 8).

:::

---

## 8. Hết ngày nghỉ và Activate

Khi kỳ nghỉ **kết thúc đúng hạn**, nhân viên **không** tự về Active.

**Sau ngày kết thúc:**

1. Kỳ nghỉ đánh dấu đã kết thúc (**Ended**)
2. Nhân viên **vẫn On leave** — chưa nhận task mới
3. Admin bấm **Activate** để nhân viên đi làm lại

**Admin Activate ở đâu**

- Banner nhắc trên Dashboard, Users, hoặc Tracker
- Nút **Activate employee** trên User detail

Sau Activate: nhân viên **Active**, nhận task trở lại.

:::warning[Chỉ Admin được Activate]

PM / Creative Manager / Creative Head **không** Activate sau khi hết nghỉ.  
Họ chỉ **hủy sớm** khi kỳ nghỉ còn đang diễn ra (mục 7).

:::

---

## 9. Quy tắc cần nhớ

1. **Confirm = On leave ngay** — không đợi tới ngày bắt đầu trên lịch.
2. **Hết ngày nghỉ ≠ tự đi làm lại** — cần Admin **Activate**.
3. **Hủy sớm ≠ hết hạn** — hủy sớm Active ngay; hết hạn cần Admin.
4. **Không giao task** cho người On leave hoặc Overloaded (khi tạo / gán task).
5. **Hủy nghỉ không trả task về người cũ** — trừ khi chỉnh tay.
6. **Một người một kỳ nghỉ đang hiệu lực** — không chồng lịch.
7. **Phạm vi:** Admin / Head mọi phòng; PM / Creative Manager / Creative Head chỉ cùng phòng.

---

## 10. Tóm tắt nhanh

| Bước | Việc cần làm                                           | Kết quả                                            |
| ---- | ------------------------------------------------------ | -------------------------------------------------- |
| 1    | Mở **Leave** / **Schedule leave**, chọn ngày (+ lý do) | —                                                  |
| 2    | Xem task trong kỳ nghỉ, chọn người thay hoặc để trống  | —                                                  |
| 3    | **Confirm leave**                                      | **On leave ngay**; task bàn giao theo lựa chọn     |
| 4a   | Còn trong kỳ → **Cancel leave**                        | **Active ngay**; task đã bàn giao không tự đổi lại |
| 4b   | Đã hết ngày nghỉ                                       | Kỳ nghỉ **Ended**; nhân viên vẫn On leave          |
| 5    | Admin **Activate employee**                            | **Active**, nhận task trở lại                      |
