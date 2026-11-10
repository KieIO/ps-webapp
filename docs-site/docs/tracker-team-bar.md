---
sidebar_position: 6
sidebar_label: Thông tin Sale, PM, CM
slug: /tracker/team
---

# Xem thông tin Sale, PM, CM trên thanh project

Trên mỗi hàng Project Tracker, cột team và tên project hiển thị người phụ trách gắn với project.

Liên quan: [Danh sách trên timeline](/tracker)

---

## 1. Hiện gì trên hàng project?

- **Tên project** — link mở project; nếu đã có Sales thì hiện dòng phụ `Sales: …` ngay dưới tên
- **PM** — tên Project Manager của project
- **CM** — danh sách Creative Manager gắn với project / task (có thể nhiều dòng)

---

## 2. Thêm / sửa / xóa Sales

Người có quyền `EDIT_PROJECT` hoặc `EDIT_TRACKER_PROJECT` (PM / Head / Admin):

1. **Chưa có Sales:** hover ô tên project → hiện `+ Sales` → click để nhập → **Enter** hoặc click ra ngoài để lưu.
2. **Đã có:** click dòng `Sales: …` dưới tên để sửa; **Esc** để hủy.
3. Hover dòng Sales → click **×** để xóa.

Cũng có thể nhập Sales trong form **Create / Edit project** (mục People).

---

## 3. Mục đích

Nhìn nhanh ai đang phụ trách project khi duyệt timeline, không cần mở form Edit Project. Sales chỉ hiện khi đã gán — không chiếm cột riêng.

---

## 4. Tóm tắt

1. Sales là subtitle dưới tên project (`Sales: Tên`); trống thì không hiện.
2. Sales là text tự do (không bắt buộc gắn user hệ thống).
3. Cột PM/CM chỉ hiện delivery owners; gán PM / team làm ở quản lý Projects / Users.
