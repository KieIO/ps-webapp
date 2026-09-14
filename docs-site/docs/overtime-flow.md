---
sidebar_position: 1
sidebar_label: Luồng OT
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
            │
            ▼
      Staff làm task OT
            │
            ▼
      Staff đánh dấu Finished
      (nhập giờ thực tế + ghi chú)
            │
            ▼
      Head / Admin review kết quả
            │
            ├── Từ chối kết quả → quay lại Đang làm
            │
            └── Duyệt kết quả → Hoàn thành
                  │
                  ▼
            Dashboard ghi nhận giờ ước tính và giờ thực tế
```

---

## 2. Ai làm gì?

| Việc                                  | Ai làm được                                      |
| ------------------------------------- | ------------------------------------------------ |
| Tạo / sửa request (khi còn Chờ duyệt) | PM, Creative Manager, Creative Head, Head, Admin |
| Duyệt / từ chối request               | Head, Admin                                      |
| Gắn task OT sau khi duyệt             | Người có quyền xin OT                            |
| Làm task OT và nhập giờ thực tế       | Staff được chỉ định                              |
| Review kết quả OT                     | Head, Admin                                      |
| Xem danh sách OT và Dashboard         | Ai có quyền xin OT hoặc duyệt OT                 |

Creative Head có thể xin OT nhưng **không** duyệt request hay review kết quả.

---

## 3. Các trạng thái

| Trạng thái UI  | Khi nào                                                  |
| -------------- | -------------------------------------------------------- |
| **Chờ duyệt**  | Vừa tạo request, chờ Head/Admin                          |
| **Từ chối**    | Head/Admin từ chối request                               |
| **Đã duyệt**   | Head/Admin đã duyệt, chưa gắn task hoặc chưa bắt đầu làm |
| **Đang làm**   | Đã gắn task, Staff đang thực hiện                        |
| **Chờ review** | Staff đã Finished task OT và nhập giờ thực tế            |
| **Hoàn thành** | Head/Admin đã duyệt kết quả                              |

---

## 4. Chi tiết từng bước

### Bước 1: Tạo OT request

**Ai:** PM, CM, Creative Head, Head, Admin

**Cần nhập:**

- Dự án
- Người OT (Staff)
- Ngày OT
- Khung giờ bắt đầu và kết thúc (hệ thống tính giờ ước tính từ khung giờ này)
- Nhóm lý do (chọn ít nhất một)
- Mô tả lý do chi tiết

**Sau khi gửi:**

- Trạng thái: **Chờ duyệt**
- Head và Admin nhận thông báo

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

- Chọn một project task có sẵn để gắn vào request, hoặc tạo task mới rồi gắn
- Staff và khung giờ OT đã có từ bước tạo request

**Sau khi gắn:**

- Trạng thái → **Đang làm**
- Staff nhận thông báo task OT

### Bước 4: Staff làm OT

**Ai:** Staff được chỉ định

**Làm gì:**

- Nhận thông báo và mở task OT
- Làm việc trong khung giờ đã xin
- Khi xong, cập nhật trạng thái task thành **Finished**
- Nhập **giờ OT thực tế** (bắt buộc)
- Có thể thêm ghi chú

**Sau khi Finished:**

- Request chuyển **Chờ review**
- Người xin OT và Head nhận thông báo

Không có form báo cáo OT riêng. Finish task kèm giờ thực tế chính là bước báo cáo.

### Bước 5: Head / Admin review kết quả

**Ai:** chỉ Head hoặc Admin (không phải PM/CM)

**Nếu duyệt kết quả:**

- Trạng thái → **Hoàn thành**
- Người xin nhận thông báo

**Nếu từ chối kết quả:**

- Có thể kèm ghi chú
- Request quay lại **Đang làm**
- Giờ thực tế đã nhập bị xóa để Staff cập nhật lại

---

## 5. Dashboard và xuất dữ liệu

Vào **Overtime** trong menu. Có tab danh sách request và tab Dashboard.

### Dashboard hiển thị

- Tổng giờ ước tính và giờ thực tế theo tháng đang chọn
- Theo từng người
- Theo từng dự án
- Cảnh báo khi OT vượt ngưỡng tuần

### Cảnh báo ngưỡng

- Mặc định khoảng **20 giờ ước tính / tuần** (có thể đổi trong Settings)
- Chỉ để nhắc, **không chặn** tạo hay duyệt OT
- Tính trên giờ ước tính của các request đang được đếm trên dashboard

### Xuất dữ liệu

- Xuất danh sách request theo bộ lọc hiện tại (Excel/CSV)
- Dashboard có thể xuất CSV theo người trong tháng đang xem

Hiện **không** có báo cáo quý riêng hay báo cáo “tỷ lệ duyệt so với thực tế” dạng file riêng.

---

## 6. Tóm tắt nhanh

1. Xin OT: chọn sẵn Staff, ngày, khung giờ, lý do.
2. Head/Admin duyệt hoặc từ chối request.
3. Sau duyệt: gắn project task → Staff làm → Finished kèm giờ thực tế.
4. Head/Admin review kết quả lần cuối.
5. Dashboard theo dõi giờ ước tính, giờ thực tế và cảnh báo vượt ngưỡng.
