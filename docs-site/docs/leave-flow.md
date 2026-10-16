---
sidebar_position: 1
sidebar_label: Nghỉ phép
slug: /leave
---

# Luồng nghỉ phép

Hướng dẫn lên lịch nghỉ phép, bàn giao task, hủy sớm, và tự Active khi hết nghỉ.

## Đọc trước 30 giây

1. Trạng thái kỳ theo ngày:
   - **Tương lai** → kỳ **đã lên lịch**, nhân viên **vẫn Active** đến ngày bắt đầu
   - **Đang trong kỳ** → kỳ **đang diễn ra**, nhân viên **On leave**
   - **Đã hết** → kỳ **đã kết thúc**, nhân viên **tự về Active** (không cần Admin Activate)
2. Có thể đặt **nhiều kỳ không chồng lịch**; mỗi lần Confirm = một khoảng, bàn giao task riêng.
3. **Không** giao task mới cho người đang On leave / ngày thuộc kỳ đã đặt (ngày làm việc).
4. On leave **vẫn đăng nhập được**. Chỉ tài khoản **Deactivate** mới bị chặn login.
5. Tracker **không** hiện tên nghỉ vào **Thứ 7 / Chủ nhật**.

Đưa về **Active** sớm hơn lịch:

| Tình huống                            | Cách làm                   | Ai làm                       |
| ------------------------------------- | -------------------------- | ---------------------------- |
| Đi làm **trước** ngày kết thúc đã đặt | **Cancel leave** (từng kỳ) | Người có quyền lên lịch nghỉ |
| Kỳ **đã hết đúng hạn**                | Tự Active                  | Hệ thống                     |

:::tip[Hay nhầm nhất]

Hết nghỉ **không** cần Admin Activate. Status về Active tự động; kỳ đã lên lịch phía sau vẫn giữ, tới ngày sẽ On leave lại.

:::

---

## Thay đổi so với trước

### Trước

Mỗi người chỉ **một kỳ đang mở**. Confirm xong → **On leave ngay** (kể cả nghỉ tương lai). Hủy / bàn giao gắn theo người. Wizard **không** hiện kỳ đã đặt. Hết nghỉ phải Admin Activate mới login / đi làm lại.

### Sau

- Nhiều kỳ không chồng; mỗi Confirm một khoảng.
- On leave **đúng ngày**; kỳ tương lai giữ Active.
- Cancel / reassign **theo từng kỳ**.
- Hết kỳ → **tự Active**; On leave vẫn login được.
- Tracker ẩn tên nghỉ T7/CN.
- Wizard: **Already booked**, khoá ngày đã chiếm.

---

## 1. Luồng tổng quan

```text
Mở lên lịch nghỉ
      │
      ▼
Chọn ngày (+ lý do, tuỳ chọn)
      │
      ▼
Xem task trong kỳ → chọn người thay (hoặc để trống)
      │
      ▼
Confirm leave (một khoảng / lần)
      │
      ├── Tương lai: đã lên lịch, giữ Active
      ├── Cover hôm nay: đang diễn ra, On leave
      ├── Đã hết: đã kết thúc, giữ Active
      └── Task: bàn giao theo lựa chọn
      │
      ▼
(Có thể lên lịch thêm kỳ khác nếu không chồng ngày)
      │
      ├── Hủy từng kỳ → Active ngay (nếu đang On leave vì kỳ đó)
      │
      └── Hết hạn đúng lịch → tự Active
          (đợt đã lên lịch sau vẫn giữ, tới ngày tự On leave)
```

---

## 2. Ai được làm gì?

| Việc                                | Ai làm được                                                  |
| ----------------------------------- | ------------------------------------------------------------ |
| Lên lịch, xem task, chọn người thay | PM, Creative Manager, Creative Head, Head, Admin             |
| Hủy nghỉ sớm (kỳ còn hiệu lực)      | Cùng nhóm trên                                               |
| Xem lịch sử nghỉ trên hồ sơ         | Chính nhân viên đó, hoặc người có quyền quản lý user / leave |

| Vai trò                             | Phạm vi lên lịch / hủy |
| ----------------------------------- | ---------------------- |
| Admin, Head                         | Mọi nhân viên          |
| PM, Creative Manager, Creative Head | Chỉ **cùng phòng ban** |

Nhân viên (Employee) và Sale **không** tự lên lịch nghỉ.

---

## 3. Các trạng thái

Hai lớp trạng thái, đừng nhầm.

### Nhân viên (Users)

| Trạng thái                 | Ý nghĩa                                                    |
| -------------------------- | ---------------------------------------------------------- |
| **Active**                 | Đang làm; có thể nhận task; có thể lên lịch nhiều kỳ       |
| **On leave**               | Đang trong kỳ nghỉ; **vẫn login**; **không** giao task mới |
| **Inactive** / **Invited** | Inactive: không login; cả hai không lên lịch nghỉ          |

### Kỳ nghỉ

| Trạng thái trên UI | Ý nghĩa                                             |
| ------------------ | --------------------------------------------------- |
| **Scheduled**      | Đã đặt, chưa tới ngày bắt đầu; nhân viên vẫn Active |
| **Active**         | Kỳ đang cover hôm nay                               |
| **Cancelled**      | Đã hủy kỳ đó                                        |
| **Ended**          | Đã qua ngày kết thúc; nhân viên đã / sẽ tự Active   |

---

## 4. Vào đâu?

1. **Users** → nhân viên **Active** → **Leave**
2. **User detail** → **Leave** → **Schedule leave**

:::note[Đừng đổi Status tay thành On leave]

**Status → On leave** trên User detail **không** lưu thẳng; hệ thống mở wizard.  
Về Active sớm: dùng **Cancel** khi còn trong kỳ. Hết hạn thì hệ thống tự Active.

:::

---

## 5. Lên lịch nghỉ

### Bước 1: Chọn ngày

- Ngày bắt đầu / kết thúc, lý do (tuỳ chọn)
- Nhân viên **Active** hoặc **On leave** (không Inactive / Invited)
- Không chồng kỳ **đã lên lịch** hoặc **đang diễn ra** khác
- Mỗi Confirm = **một khoảng**; muốn nhiều đợt thì Schedule thêm
- Wizard hiện **Already booked** và khoá ngày đã chiếm

### Bước 2: Bàn giao task

Liệt kê task của người nghỉ có ngày trong kỳ, confirmation còn **Confirmed** hoặc **Not updated**.

- Chọn **người thay** (cùng phòng, Active, không Off / On leave ngày đó; có % capacity)
- Hoặc **để trống** (gỡ người nghỉ khỏi task)

### Bước 3: Confirm

- Tương lai → kỳ **đã lên lịch**, giữ **Active**
- Cover hôm nay → kỳ **đang diễn ra**, **On leave**
- Cả kỳ đã qua → kỳ **đã kết thúc**, giữ **Active**
- Task trong khoảng được bàn giao theo bước 2

---

## 6. Trong thời gian On leave

| Việc thử                    | Hệ thống                                              |
| --------------------------- | ----------------------------------------------------- |
| Đăng nhập                   | **Được** (chỉ Deactivate mới chặn)                    |
| Giao / đổi staff trên task  | **Không** chọn được người On leave                    |
| Capacity / Create task      | Hiện đang nghỉ; không giao được                       |
| Project Tracker             | Hiện tên nghỉ **ngày làm việc**; **không** hiện T7/CN |
| Đổi Status tay thành Active | Không cần để “mở login”; hết kỳ sẽ tự Active          |

---

## 7. Hủy nghỉ sớm

Dùng khi cần đi làm lại **trước** ngày kết thúc đã đặt. Hủy **theo từng kỳ** còn hiệu lực.

**Ai:** cùng nhóm có quyền lên lịch, đúng phạm vi phòng ban (mục 2).

**Sau khi hủy:**

1. Kỳ đó **Cancelled**
2. Nếu đang On leave vì kỳ đó → về **Active ngay**
3. Task đã bàn giao **không** tự hoàn; muốn người cũ nhận lại thì chỉnh tay

---

## 8. Hết ngày nghỉ

Kết thúc đúng hạn → hệ thống **tự Active** (không cần Admin).

1. Kỳ → **Ended**
2. Nhân viên → **Active**, nhận task trở lại
3. Kỳ nghỉ tương lai đã lên lịch vẫn giữ; tới ngày sẽ On leave lại

---

## 9. Checklist test thủ công

**Chuẩn bị:** quyền Schedule leave (Admin / managers). Nhân viên **Active**, chưa nghỉ.

### Smoke

| #   | Case                 | Cách làm                              | Kỳ vọng                                               |
| --- | -------------------- | ------------------------------------- | ----------------------------------------------------- |
| 1   | Nghỉ tương lai       | Schedule **sau hôm nay**, Confirm     | **Scheduled**, vẫn **Active**                         |
| 2   | Thêm kỳ 2            | Schedule khoảng sau kỳ 1, không chồng | 2 dòng; wizard **Already booked**                     |
| 3   | Chồng lịch           | Chọn ngày đã book                     | Disabled / lỗi overlap                                |
| 4   | Cover hôm nay        | Khoảng có hôm nay                     | **On leave**, vẫn **login được**, không giao task mới |
| 5   | Fri→Mon trên Tracker | Schedule T6→T2                        | Tracker hiện T6 + T2; **không** hiện T7/CN            |
| 6   | Hủy theo kỳ          | 2 kỳ → Cancel 1                       | Chỉ kỳ đó Cancelled                                   |
| 7   | Hết kỳ               | Kỳ On leave đã hết (hoặc đợi sync)    | **Tự Active**, không cần Activate                     |
