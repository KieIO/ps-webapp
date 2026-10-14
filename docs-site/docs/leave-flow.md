---
sidebar_position: 1
sidebar_label: Luồng nghỉ phép
slug: /leave
---

# Luồng nghỉ phép

Hướng dẫn lên lịch nghỉ phép, bàn giao task, hủy sớm, và Activate khi hết nghỉ.

## Đọc trước 30 giây

1. Trạng thái kỳ theo ngày:
   - **Tương lai** → `scheduled`, nhân viên **giữ Active** đến ngày bắt đầu
   - **Đang trong kỳ** → `active`, nhân viên **On leave**
   - **Đã hết** → `ended`, ghi lịch sử, **giữ Active** (nếu trước đó chưa On leave)
2. Có thể đặt **nhiều kỳ không chồng lịch**; mỗi Confirm = một khoảng, bàn giao task riêng.
3. **Không** giao task mới cho người đang On leave / ngày thuộc kỳ đã đặt.

Đưa về **Active** bằng một trong hai cách:

| Tình huống                            | Cách làm                   | Ai làm                       |
| ------------------------------------- | -------------------------- | ---------------------------- |
| Đi làm **trước** ngày kết thúc đã đặt | **Cancel leave** (từng kỳ) | Người có quyền lên lịch nghỉ |
| Kỳ **đã hết đúng hạn**                | **Activate employee**      | **Chỉ Admin**                |

:::tip[Hay nhầm nhất]

Hết mỗi đợt nghỉ **không** tự Active. Banner / section **Cần Activate** nhắc Admin. Phải bấm **Activate**; nếu không vẫn On leave (kể cả khi còn đợt `scheduled` sau).

:::

---

## Thay đổi so với trước

### Trước

Mỗi người chỉ **một kỳ đang mở**. Confirm xong → **On leave ngay** (kể cả nghỉ tương lai). Hủy / bàn giao gắn theo người. Wizard **không** hiện kỳ đã đặt.

### Sau (multi leave + UX)

- Nhiều kỳ không chồng; mỗi Confirm một khoảng.
- Kỳ có `scheduled` / `active` / `ended` / `cancelled`.
- On leave **đúng ngày** (chỉ khi hôm nay trong kỳ `active`).
- Cancel / reassign **theo từng kỳ**.
- Hết mỗi kỳ → chờ Admin Activate; kỳ `scheduled` sau vẫn giữ.
- Banner / section **Cần Activate**.
- Wizard: **Already booked**, khoá ngày đã chiếm, báo lỗi nếu chồng lịch.

**Tóm lại:** trước là một kỳ và On leave ngay; sau là nhiều kỳ theo lịch thật, quản lý từng kỳ, Activate có nhắc, wizard thấy ngày đã book.

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
      ├── Tương lai: scheduled, giữ Active
      ├── Cover hôm nay: active, On leave
      ├── Đã hết: ended, giữ Active
      └── Task: bàn giao theo lựa chọn
      │
      ▼
(Có thể Schedule thêm kỳ khác nếu không chồng ngày)
      │
      ├── Hủy từng kỳ → cancel theo leaveId
      │
      └── Hết hạn đúng lịch
                │
                ▼
          Vẫn On leave + banner Cần Activate
                │
                ▼
          Admin Activate → Active
          (đợt scheduled sau vẫn giữ, tới ngày tự On leave)
```

---

## 2. Ai được làm gì?

| Việc                                | Ai làm được                                                  |
| ----------------------------------- | ------------------------------------------------------------ |
| Lên lịch, xem task, chọn người thay | PM, Creative Manager, Creative Head, Head, Admin             |
| Hủy nghỉ sớm (kỳ còn hiệu lực)      | Cùng nhóm trên                                               |
| Activate sau khi hết nghỉ           | **Chỉ Admin**                                                |
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

| Trạng thái                 | Ý nghĩa                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| **Active**                 | Đang làm; có thể nhận task; có thể lên lịch nhiều kỳ              |
| **On leave**               | Đang trong kỳ hoặc vừa hết chưa Activate; **không** giao task mới |
| **Inactive** / **Invited** | Không lên lịch nghỉ được                                          |

### Kỳ nghỉ

| Trạng thái    | Ý nghĩa                                                            |
| ------------- | ------------------------------------------------------------------ |
| **Scheduled** | Đã đặt, chưa tới ngày bắt đầu; nhân viên vẫn Active                |
| **Active**    | Kỳ đang cover hôm nay                                              |
| **Cancelled** | Đã hủy kỳ đó                                                       |
| **Ended**     | Đã qua ngày kết thúc; nếu trước đó On leave thì chờ Admin Activate |

---

## 4. Vào đâu?

1. **Users** → nhân viên **Active** → **Leave**
2. **User detail** → **Leave** → **Schedule leave**

:::note[Đừng đổi Status tay thành On leave]

**Status → On leave** trên User detail **không** lưu thẳng; hệ thống mở wizard.  
Về Active: **Cancel** (còn trong kỳ) hoặc **Activate** (Admin, sau hết hạn). Không Save Status tay.

:::

---

## 5. Lên lịch nghỉ

### Bước 1: Chọn ngày

- Ngày bắt đầu / kết thúc, lý do (tuỳ chọn)
- Nhân viên **Active** hoặc **On leave** (không Inactive / Invited)
- Không chồng kỳ `scheduled` / `active` khác
- Mỗi Confirm = **một khoảng**; muốn nhiều đợt thì Schedule thêm
- Wizard hiện **Already booked** và khoá ngày đã chiếm

### Bước 2: Bàn giao task

Liệt kê task của người nghỉ có ngày trong kỳ, confirmation còn **Confirmed** hoặc **Not updated**.

- Chọn **người thay** (cùng phòng, Active, không Off / On leave ngày đó; có % capacity)
- Hoặc **để trống** (gỡ người nghỉ khỏi task)

### Bước 3: Confirm

Tóm tắt nhân viên, khoảng ngày, lý do, số task đã chọn người thay.

- Tương lai → `scheduled`, giữ **Active**
- Cover hôm nay → `active`, **On leave**
- Cả kỳ đã qua → `ended`, giữ **Active**
- Task trong khoảng được bàn giao theo bước 2

---

## 6. Trong thời gian On leave

| Việc thử                   | Hệ thống                                         |
| -------------------------- | ------------------------------------------------ |
| Giao / đổi staff trên task | **Không** chọn được người On leave               |
| Capacity / Create task     | Hiện đang nghỉ; không assign                     |
| Project Tracker            | Tên theo ngày trong kỳ leave; không gồm Inactive |
| Đổi Status tay             | **Không** thoát On leave bằng cách này           |

---

## 7. Hủy nghỉ sớm

Dùng khi cần đi làm lại **trước** ngày kết thúc đã đặt. Hủy **theo từng kỳ** còn hiệu lực.

**Ai:** cùng nhóm có quyền lên lịch, đúng phạm vi phòng ban (mục 2).

**Sau khi hủy:**

1. Kỳ đó **Cancelled**
2. Nếu đang On leave vì kỳ đó → về **Active ngay** (không cần Admin)
3. Task đã bàn giao **không** tự hoàn; muốn người cũ nhận lại thì chỉnh tay

:::tip[Hủy sớm ≠ hết hạn]

Hủy sớm → Active ngay (khi đang On leave vì kỳ đó).  
Hết hạn đúng lịch → vẫn On leave đến khi Admin **Activate** (mục 8).

:::

---

## 8. Hết ngày nghỉ và Activate

Kết thúc đúng hạn → nhân viên **không** tự Active.

1. Kỳ → **Ended**
2. Nhân viên **vẫn On leave**
3. Admin **Activate** (banner trên Dashboard / Users / Tracker, hoặc nút trên User detail)

Sau Activate: **Active**, nhận task trở lại. Kỳ `scheduled` sau vẫn giữ; tới ngày sẽ On leave lại.

:::warning[Chỉ Admin được Activate]

PM / Creative Manager / Creative Head **không** Activate sau hết nghỉ. Họ chỉ **hủy sớm** khi kỳ còn diễn ra (mục 7).

:::

---

## 9. Checklist test thủ công

**Chuẩn bị:** quyền Schedule leave + 1 Admin Activate. Nhân viên **Active**, chưa nghỉ.

### Smoke (làm trước)

| #   | Case              | Cách làm                              | Kỳ vọng                                                         |
| --- | ----------------- | ------------------------------------- | --------------------------------------------------------------- |
| 1   | Nghỉ tương lai    | Schedule **sau hôm nay**, Confirm     | **Scheduled**, vẫn **Active**                                   |
| 2   | Thêm kỳ 2         | Schedule khoảng sau kỳ 1, không chồng | 2 dòng trên profile; wizard **Already booked**, ngày kỳ 1 khoá  |
| 3   | Chồng lịch        | Chọn ngày đã book                     | Disabled / lỗi overlap, không Confirm                           |
| 4   | Cover hôm nay     | Khoảng có hôm nay                     | Kỳ **Active**, **On leave**, không giao task mới                |
| 5   | Hủy theo kỳ       | 2 kỳ → Cancel 1                       | Chỉ kỳ đó Cancelled; task không tự hoàn                         |
| 6   | Hết kỳ + Activate | On leave, kỳ đã hết → Admin Activate  | Banner / section nhắc; sau Activate → Active; Scheduled sau giữ |

### Thêm nếu còn thời gian

| #   | Case              | Cách làm                                                      | Kỳ vọng                                      |
| --- | ----------------- | ------------------------------------------------------------- | -------------------------------------------- |
| 7   | Activate từng đợt | Hết A → Activate → tới B → On leave → hết B → Activate lại    | Mỗi lần hết kỳ On leave đều cần Activate     |
| 8   | Bàn giao wizard   | Kỳ có task → Review → Confirm                                 | Có bảng task / empty đúng; leave đúng khoảng |
| 9   | Scope quyền       | PM/CM cùng phòng; employee không schedule; chỉ Admin Activate | Đúng mục 2                                   |
