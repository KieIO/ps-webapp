---
sidebar_position: 1
sidebar_label: PM chỉnh sửa project
slug: /projects/pm-edit
---

# PM chỉnh sửa thông tin project

Quyền **Edit Project** của role **PM** (permission `EDIT_TRACKER_PROJECT`): PM **không** chỉnh độ khó; chỉ một số field vận hành.

Head / Admin dùng `EDIT_PROJECT` — chỉnh đủ field registry (kể cả độ khó).

---

## 1. Độ khó (Level)

**Độ khó project** = **Level 1–5**, tính từ **Volume / Nature / Time** (trung bình làm tròn).

| Ai              | Volume / Nature / Time |      Level      |
| --------------- | :--------------------: | :-------------: |
| **Head, Admin** |           ✓            | Tự tính khi lưu |
| **PM**          |           ✗            |     Chỉ xem     |

Server **không** nhận Level do client gửi; luôn tính lại từ 3 tiêu chí. PM gửi Volume/Nature/Time khác → backend **giữ giá trị cũ**.

---

## 2. PM được sửa gì?

Trên form **Edit project** (Projects / Tracker):

| Field                                                                              | PM  | Ghi chú                               |
| ---------------------------------------------------------------------------------- | :-: | ------------------------------------- |
| **Ngày kết thúc** (`endDate`)                                                      |  ✓  | Ngày bắt đầu khóa với PM              |
| **Số lượng slide** (`plannedSlides`)                                               |  ✓  | Planned slides trên Tracker Total     |
| **Status**                                                                         |  ✓  |                                       |
| **Mốc bàn giao** (milestones)                                                      |  ✓  | Cùng quyền PM/Head/Admin trên Tracker |
| **Note**                                                                           |  ✓  |                                       |
| Độ khó (Volume / Nature / Time)                                                    |  ✗  | Chỉ Head / Admin                      |
| Tên, client, brief, người, Sales trên form, đánh giá chất lượng, urgency trên form |  ✗  | Registry / đánh giá: Head–Admin       |

**Ngoài form Edit** (Tracker):

- Đổi **urgency** (chấm ưu tiên) — endpoint riêng.
- Sửa **Sales** inline trên hàng project — endpoint riêng.

Xem thêm: [FAQ — PM trên Tracker](/faq) · [Mốc giao](/milestone) · [Timeline](/tracker)

---

## 3. Test coverage

API **PM-54 / PM-55**, unit allowlist, e2e **PM-54** — xem `ps-webapp/docs/project-pm-edit-test-coverage.md`.

---

## 4. Tóm tắt

1. PM **không** sửa độ khó project.
2. PM sửa: **end date**, **planned slides**, **status**, **milestones**, **note**.
3. Head / Admin sửa full (gồm Evaluation criteria → Level).
