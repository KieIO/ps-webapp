---
sidebar_position: 1
sidebar_label: Overtime (OT)
slug: /overtime
---

# Luồng Overtime (OT)

Hướng dẫn này mô tả cách xin OT, duyệt, gắn task, làm việc, review kết quả và xem dashboard trên Pokeslide.

---

## 1. Sơ đồ tổng quan

```text
Người có quyền xin OT tạo request
(đã chọn Staff + ngày giờ OT)
      │
      ▼
Head / Admin duyệt hoặc từ chối
      │
      ├── Từ chối → người xin nhận thông báo + lý do → Kết thúc
      │
      └── Duyệt
            │
            ▼
      Gắn project task vào request OT
      (chọn sẵn hoặc tạo task mới rồi gắn)
            │
            ▼
      Staff làm task OT
            │
            ▼
      Staff đánh dấu Finished
      (giờ thực tế + ghi chú — bắt buộc)
            │
            ▼
      Head / Admin review kết quả
            │
            ├── Từ chối kết quả → quay lại Đang làm
            │   (xóa giờ thực tế, task về Chưa cập nhật)
            │
            └── Duyệt kết quả → Hoàn thành
                  │
                  ▼
            Dashboard ghi nhận giờ ước tính và giờ thực tế
```

---

## 2. Vào đâu?

| Chỗ                                   | Làm được gì                                     |
| ------------------------------------- | ----------------------------------------------- |
| Menu **Overtime**                     | Danh sách request, tạo/sửa, gắn task, Dashboard |
| **Chi tiết dự án** → section Overtime | Xem OT của project; tạo OT sẵn chọn project đó  |
| **Home** (Head / Admin)               | Duyệt nhanh các request **Chờ duyệt**           |
| **My Tasks** (Staff)                  | Làm task OT đã gắn; filter task OT nếu cần      |

Menu Overtime hiện với ai có quyền **xin OT** hoặc **duyệt OT**.

---

## 3. Ai làm gì?

| Việc                                | Ai làm được                                      |
| ----------------------------------- | ------------------------------------------------ |
| Tạo request                         | PM, Creative Manager, Creative Head, Head, Admin |
| Sửa request (chỉ khi **Chờ duyệt**) | Người có quyền xin OT                            |
| Duyệt / từ chối request             | Head, Admin                                      |
| Gắn task OT sau khi duyệt           | Người có quyền xin OT                            |
| Làm task OT và nộp giờ thực tế      | Staff (Employee) được chỉ định                   |
| Review kết quả OT                   | Head, Admin                                      |
| Đổi ngưỡng cảnh báo OT (Settings)   | Head, Creative Head, Admin                       |
| Xem danh sách OT và Dashboard       | Ai có quyền xin OT hoặc duyệt OT                 |

Creative Head có thể xin OT và chỉnh ngưỡng cảnh báo, nhưng **không** duyệt request hay review kết quả.

**Người OT** luôn là **Staff (Employee) đang Active** — không chọn PM / Head / CH làm người OT.

---

## 4. Các trạng thái

| Trạng thái UI  | Khi nào                                       |
| -------------- | --------------------------------------------- |
| **Chờ duyệt**  | Vừa tạo request, chờ Head/Admin               |
| **Từ chối**    | Head/Admin từ chối request                    |
| **Đã duyệt**   | Head/Admin đã duyệt, chưa gắn task            |
| **Đang làm**   | Đã gắn task, Staff đang thực hiện             |
| **Chờ review** | Staff đã Finished task OT và nhập giờ thực tế |
| **Hoàn thành** | Head/Admin đã duyệt kết quả                   |

Chỉ sửa request khi còn **Chờ duyệt**. Đã duyệt / từ chối thì không sửa được.

---

## 5. Chi tiết từng bước

### Bước 1: Tạo OT request

**Ai:** PM, CM, Creative Head, Head, Admin

**Cần nhập:**

- Dự án (không phải project đã archive)
- Người OT (Staff Active)
- Ngày OT
- Khung giờ bắt đầu và kết thúc (hệ thống tự tính **giờ ước tính**; tối đa 24h và không vượt khung giờ)
- Nhóm lý do (chọn ít nhất một): Late Feedbacks, Urgent, Scope of Works, Internal / Cross-department Delay, Technical Issue, Holidays, Others
- Mô tả lý do chi tiết

**Lưu ý thời gian:** nếu chọn **hôm nay**, không chọn khung giờ đã qua.

**Sau khi gửi:**

- Trạng thái: **Chờ duyệt**
- Head và Admin nhận thông báo
- Có thể sửa request khi còn Chờ duyệt

Lúc này **chưa** chọn task. Task gắn sau khi được duyệt.

### Bước 2: Head / Admin xem xét request

**Nếu duyệt:**

- Trạng thái → **Đã duyệt**
- Người xin nhận thông báo

**Nếu từ chối:**

- Phải nhập lý do từ chối
- Người xin nhận thông báo kèm lý do
- Trạng thái → **Từ chối**
- Luồng kết thúc

### Bước 3: Gắn task OT

**Điều kiện:** request đã **Đã duyệt**

**Làm gì:**

- Chọn một **project task** cùng dự án để gắn, hoặc **Tạo task mới** rồi gắn
- Staff và khung giờ OT đã có từ bước tạo request

**Task được gắn phải:**

- Là project task của đúng dự án OT
- Chưa Finished / Cancelled
- Chưa gắn OT request khác
- Chưa giao cho Staff khác (nếu chưa có người nhận, hệ thống gán Staff OT khi gắn)

**Sau khi gắn:**

- Trạng thái → **Đang làm**
- Staff nhận thông báo task OT

### Bước 4: Staff làm OT

**Ai:** Staff được chỉ định

**Làm gì:**

- Nhận thông báo và mở task OT (My Tasks / link từ chi tiết OT)
- Làm việc trong khung giờ đã xin
- Khi xong, cập nhật trạng thái task thành **Finished**
- Nhập **giờ OT thực tế** (> 0) — **bắt buộc**
- Nhập **ghi chú** — **bắt buộc** với task OT

**Sau khi Finished:**

- Request chuyển **Chờ review**
- Người xin OT và Head/Admin nhận thông báo

Không có form báo cáo OT riêng. Finish task kèm giờ thực tế chính là bước báo cáo.

### Bước 5: Head / Admin review kết quả

**Ai:** chỉ Head hoặc Admin (không phải PM/CM/CH)

**Nếu duyệt kết quả:**

- Trạng thái → **Hoàn thành**
- Người xin nhận thông báo

**Nếu từ chối kết quả:**

- **Phải** nhập ghi chú / lý do
- Request quay lại **Đang làm**
- Giờ thực tế và ghi chú staff trên OT bị xóa
- Task OT về **Chưa cập nhật** để Staff làm và nộp lại

---

## 6. Dashboard và xuất dữ liệu

Vào **Overtime** trong menu. Có tab danh sách request và tab Dashboard.

### Dashboard hiển thị

- Tổng giờ ước tính và giờ thực tế theo tháng đang chọn
- Theo từng người
- Theo từng dự án
- Xu hướng theo tuần trong tháng
- Cảnh báo khi OT vượt ngưỡng tuần

### Cảnh báo ngưỡng

- Mặc định **20 giờ ước tính / tuần** (đổi trong **Settings → Overtime alerts**)
- Chỉ để nhắc, **không chặn** tạo hay duyệt OT
- Chỉ tính request **Đã duyệt / Đang làm / Chờ review / Hoàn thành** (không tính Chờ duyệt và Từ chối)
- Gom theo nhân sự và tuần (Thứ 2 → Chủ nhật)

### Xuất dữ liệu

- Xuất danh sách request theo bộ lọc hiện tại (Excel/CSV)
- Dashboard có thể xuất CSV theo người trong tháng đang xem

Hiện **không** có báo cáo quý riêng hay báo cáo “tỷ lệ duyệt so với thực tế” dạng file riêng.

---

## 7. Tóm tắt nhanh

1. Xin OT: chọn Staff, ngày, khung giờ, lý do (chưa gắn task).
2. Head/Admin duyệt hoặc từ chối request.
3. Sau duyệt: gắn project task (có sẵn hoặc tạo mới) → Staff làm → Finished kèm giờ thực tế + ghi chú.
4. Head/Admin review kết quả lần cuối (từ chối thì Staff nộp lại).
5. Dashboard theo dõi giờ ước tính, giờ thực tế và cảnh báo vượt ngưỡng.
