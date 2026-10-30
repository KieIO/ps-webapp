# Bảng phủ test luồng Task

**Nguồn tra cứu** xem case nào đã được cover ở đâu cho: **tạo** / **giao** / **từ chối giao** / **sửa** / **xoá**.

| Tài liệu                                               | Vai trò                                    |
| ------------------------------------------------------ | ------------------------------------------ |
| **File này**                                           | Bản đồ phủ — mỗi dòng một case, chỉ link   |
| [`task-mgmt-test-cases.md`](./task-mgmt-test-cases.md) | Checklist thủ công (seed-dev)              |
| [`task-mgmt-automation.md`](./task-mgmt-automation.md) | Chiến lược tự động hoá + map TASK-01…78 cũ |

**Không** copy đầy đủ bước vào đây. Thêm case mới: thêm một dòng + viết test; chỉ sửa file companion khi bước thủ công đổi.

### Cách chạy

| Lớp       | Lệnh                                                                 |
| --------- | -------------------------------------------------------------------- |
| API (Go)  | `cd ps-be && go test ./internal/integration/ -run TaskMgmt -count=1` |
| E2E       | `cd ps-webapp && npm run test:e2e:tasks`                             |
| Unit (FE) | `cd ps-webapp && npm test -- --run src/features/tasks`               |

Đường dẫn dưới đây tính từ `ps-be/` và `ps-webapp/`.

### Chú giải cột

| Cột    | Ý nghĩa                                                             |
| ------ | ------------------------------------------------------------------- | ----------------------- | -------------------- |
| API    | Integration Go trong `ps-be/internal/integration/task_mgmt_test.go` |
| E2E    | Playwright trong `ps-webapp/e2e/tasks/`                             |
| Unit   | Vitest FE trong `ps-webapp/src/features/tasks/`                     |
| Manual | Checklist / smoke thủ công                                          |
| ●      | Đã có · ○                                                           | Chưa có / còn thiếu · ~ | Một phần / liên quan |

> **Lưu ý ID:** Số TASK trên checklist cũ có thể lệch so với repo. Ưu tiên **tên test trong code + bảng này**. BE đang có hai hàm `TASK64_*` (tách phần còn lại khi đánh giá vs CH từ chối nhận).

---

## 1. Tạo task

| ID         | Case                                                                                                                                                          | API | E2E | Unit | Manual | Path / note                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | -------------------------------------------------------------------------------------------------------------------------------- |
| TASK-01    | Admin tạo task dự án                                                                                                                                          |  ●  |  ●  |  ~   |   ●    | `TASK01` · `task-01-63-create-task-ui.spec.ts` · unit: `buildCreateTaskPayload`                                                  |
| TASK-02    | PM tạo task dự án                                                                                                                                             |  ●  |  ●  |  ○   |   ●    | `TASK02` · cùng create-task UI (PM mở drawer + Creative path)                                                                    |
| TASK-03    | Tạo task ngoài dự án                                                                                                                                          |  ●  |  ●  |  ○   |   ●    | `TASK03` · CreateTaskModal trên `/tasks/non-project`                                                                             |
| TASK-04    | Hệ thống tự tính level từ tiêu chí                                                                                                                            |  ●  |  ●  |  ~   |   ●    | `TASK04` · UI Level badge · unit `computeTaskLevel`                                                                              |
| TASK-05    | Task dự án bắt buộc chọn người nhận                                                                                                                           |  ●  |  ●  |  ○   |   ●    | `TASK05` · UI chặn thiếu «Giao cho»                                                                                              |
| TASK-06    | Tạo task Creative (chưa giao) → task vào hàng chờ Creative Head                                                                                               |  ●  |  ●  |  ~   |   ●    | `TASK06` · create-task UI + `task-47-57-…`                                                                                       |
| TASK-27    | Head không được tạo task                                                                                                                                      |  ●  |  ●  |  ○   |   ●    | `TASK27` · `task-44-create-button-by-role.spec.ts`                                                                               |
| TASK-28    | Nhân viên không được tạo task                                                                                                                                 |  ●  |  ●  |  ○   |   ●    | `TASK28` · cùng task-44 (Employee/CH/CM)                                                                                         |
| TASK-39–42 | Kiểm tra dữ liệu khi tạo (tên trống, tiêu chí sai, thiếu PM, …)                                                                                               |  ●  |  ●  |  ○   |   ●    | `TASK39`…`42` · `task-39-42-create-validation.spec.ts`                                                                           |
| TASK-44    | Nút «Tạo task» hiện đúng theo vai trò                                                                                                                         |  ○  |  ●  |  ○   |   ●    | `e2e/tasks/task-44-create-button-by-role.spec.ts`                                                                                |
| TASK-61    | Tạo task phòng Dự án và giao sẵn Staff                                                                                                                        |  ●  |  ●  |  ○   |   ●    | `TASK61` · create-task UI Project → Phòng Project → Giao task                                                                    |
| TASK-62    | Tạo task Creative và giao sẵn Staff                                                                                                                           |  ●  |  ●  |  ○   |   ●    | `TASK62` · `task-62-creative-preassign-staff.spec.ts` (drawer không có Staff; API create → assigned_staff + Staff UI / CH inbox) |
| TASK-63    | So sánh tạo task Dự án vs Creative (cùng form, khác phòng)                                                                                                    |  ●  |  ●  |  ○   |   ●    | `TASK63` · Project vs Creative cards trong drawer                                                                                |
| TASK-80    | Admin: gõ tên project chưa có → **Add** mở Create project → tạo xong gắn tên + PM (link xanh khi tạo task); Add vẫn hiện khi **không còn option** khớp filter |  ○  |  ●  |  ○   |   ●    | `task-80-81-create-task-add-project.spec.ts`                                                                                     |
| TASK-81    | PM (không `CREATE_PROJECT`): gõ tên lạ → **không** thấy Add; free-text vẫn giữ trên form                                                                      |  ○  |  ●  |  ○   |   ●    | Cùng spec task-80-81                                                                                                             |
| TASK-82    | Create task: Deadline chỉ chọn ngày trong `startDate`–`endDate` của project catalog; ngày ngoài bị disable                                                    |  ○  |  ○  |  ●   |   ●    | Unit `taskDates` (`isOutsideProjectDateRange` / `clampDeadlineToProjectRange`)                                                   |

---

## 2. Giao task

Đối chiếu nhanh yêu cầu sản phẩm ↔ phủ hiện tại:

| #   | Ý                                                 | Trạng thái trong index                                      |
| --- | ------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Giao cho CH / CM / Staff                          | **Có** API + E2E (TASK-06/47/37/48–52/57/58; TASK-38 e2e ~) |
| 2   | Đổi người / giao thêm (đúng role)                 | **Có** TASK-55/59 E2E; «giao thêm» = chia nhỏ (TASK-51)     |
| 3   | Đổi deadline tổng + deadline Creative theo quyền  | **Có** TASK-70/71 (API + E2E)                               |
| 4   | Đánh giá theo role liên quan                      | **Có** TASK-35/36/66 + TASK-72/73                           |
| 5   | Hai view Project Tasks của CM (đúng data)         | Có (TASK-69 / 69b)                                          |
| 6   | CM xem đánh giá của CH; Staff xem đánh giá của CM | **Có** TASK-74/75                                           |
| 7   | Task giao Creative: xem đánh giá của PM           | **Có** TASK-76                                              |

Hướng dẫn dùng: `docs-site/docs/create-task-flow.md`, `split-task-flow.md` · Ma trận quyền: `task-permissions-matrix.md`.

### 2.1 Giao cho CH / CM / Staff

| ID      | Case                                                                                                                      | API | E2E | Unit | Manual | Path / note                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | -------------------------------------------------------------- |
| TASK-06 | PM/Admin tạo task Creative (chưa chọn Staff) → task vào hàng chờ Creative Head                                            |  ●  |  ~  |  ~   |   ●    | `TASK06` · create handoff · e2e queue row trong `task-47-57-…` |
| TASK-47 | CH (hoặc Admin) giao task đang ở hàng chờ Creative Head cho một CM → task vào hàng chờ Creative Manager. PM không giao CM |  ●  |  ●  |  ~   |   ●    | `TASK47` · `task-47-57-creative-assign-ui.spec.ts`             |
| TASK-48 | Staff, CM và PM gọi assign-cm thì 403. CH và Admin được giao CM                                                           |  ●  |  ●  |  ○   |   ●    | `TASK48` · `task-48-58-assign-guards.spec.ts`                  |
| TASK-49 | Không giao được CM nếu người chọn không phải role CM, hoặc task chưa ở hàng chờ Creative Head (API 422)                   |  ●  |  ●  |  ○   |   ●    | `TASK49` · 422 · cùng guards spec                              |
| TASK-37 | Admin/PM giao (hoặc đổi) Staff trên task phòng Dự án — tối đa 1 người                                                     |  ●  |  ●  |  ○   |   ●    | `TASK37` · `task-37-56-project-assign-visibility.spec.ts`      |
| TASK-50 | CM được giao task đó giao cả khối cho đúng 1 Staff (kèm số lượng)                                                         |  ●  |  ●  |  ~   |   ●    | `TASK50` · `task-47-57-…` (drawer + API whole)                 |
| TASK-51 | PM/Admin chia task thành ≥2 task con. SL cha giữ nguyên; tổng các phần không vượt SL cha. CM không tạo task con           |  ●  |  ●  |  ~   |   ●    | `TASK51` · API split                                           |
| TASK-52 | Chỉ CM đang phụ trách task (hoặc Admin/PM) được giao nguyên; Staff thường / CM khác bị 403                                |  ●  |  ●  |  ○   |   ●    | `TASK52` · guards spec                                         |
| TASK-58 | Giao nguyên thiếu số lượng bị 422. Split dưới 2 phần bị 422. CM gọi chia nhỏ bị 403                                       |  ●  |  ●  |  ○   |   ●    | `TASK58` · guards spec                                         |
| TASK-38 | Không cho tạo/giao nếu người nhận đang On leave → 422 `ASSIGNEE_ON_LEAVE` (chặn, không chỉ cảnh báo)                      |  ●  |  ~  |  ~   |   ●    | `TASK38` · e2e skip nếu users PATCH status không dùng được     |
| TASK-57 | Happy path Creative: tạo → CH giao CM → CM giao Staff (cả khối) thành công                                                |  ●  |  ●  |  ○   |   ●    | `TASK57` · `task-47-57-…`                                      |

### 2.2 Đổi người giao / giao lại

| ID      | Case                                                                                                                                                           | API | E2E | Unit | Manual | Path / note                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | ------------------------------------------- |
| TASK-55 | Khi task còn ở hàng chờ Creative Manager: CH/Admin đổi sang CM khác được; CM không được tự đổi CM                                                              |  ●  |  ●  |  ○   |   ●    | `TASK55` · `task-55-59-reassign-ui.spec.ts` |
| TASK-59 | Sau khi đã giao Staff: CM/Admin (và PM đủ điều kiện) đổi sang Staff khác được                                                                                  |  ●  |  ●  |  ○   |   ●    | `TASK59` · cùng reassign spec               |
| TASK-60 | Task nhỏ Staff đã Confirm: vẫn đổi được số lượng hoặc đổi Staff; đổi Staff thì Confirm về «chưa cập nhật» (Staff Confirm lại). Đã Hoàn thành thì khoá số lượng |  ●  |  ~  |  ~   |   ●    | `TASK60` · E2E task-66                      |
| TASK-65 | Sau khi CH từ chối task giao: chỉ PM/Admin đưa task lại hàng chờ Creative Head; CH không tự đưa lại                                                            |  ●  |  ●  |  ~   |   ○    | `task-65-pm-rehand-ch.spec.ts`              |

### 2.3 Deadline tổng & deadline Creative (theo quyền)

| ID      | Case                                                                                                   | API | E2E | Unit | Manual | Path / note                                         |
| ------- | ------------------------------------------------------------------------------------------------------ | :-: | :-: | :--: | :----: | --------------------------------------------------- |
| TASK-70 | PM/Admin sửa Deadline PM trên task Creative sau giao Staff được; Staff bị chặn                         |  ●  |  ●  |  ~   |   ○    | `TestTaskMgmt_TASK70_*` · `task-70-71-…spec.ts`     |
| TASK-71 | Sau giao Staff: CM/PM được sửa Deadline Creative; Creative Head không được sửa field này (API từ chối) |  ●  |  ●  |  ●   |   ○    | `TestTaskMgmt_TASK71_*` · unit `creativeVisibility` |

### 2.4 Hai phần view Project Tasks của CM

| ID       | Case                                                                                                                           | API | E2E | Unit | Manual | Path / note                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | :-: | :-: | :--: | :----: | ----------------------------------------- |
| TASK-69  | Chỉ CM thấy nút «Task nhận» / «Task giao Staff»; PM, CH, Staff không thấy toggle                                               |  ○  |  ●  |  ●   |   ○    | `task-69-…spec.ts` · `taskListVisibility` |
| TASK-69b | Sau chia nhỏ: task cha hiện ở «Task nhận»; từng task con hiện ở «Task giao Staff» (đúng mã/tên)                                |  ○  |  ●  |  ●   |   ○    | Cùng spec task-69                         |
| TASK-56  | Project Tasks: Admin/PM/CH thấy task cha đã chia, không thấy task con trên list chung; CM xem task con ở tab «Task giao Staff» |  ●  |  ●  |  ○   |   ●    | `TASK56` · `task-37-56-…spec.ts`          |

### 2.5 Đánh giá sau giao (theo lớp & xem chéo)

| ID      | Case                                                                                                                                                                                                                          | API | E2E | Unit | Manual | Path / note                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | --------------------------------------------------------------------- |
| TASK-35 | PM/Admin (có EVALUATE) lưu điểm + % + note trên task                                                                                                                                                                          |  ●  |  ~  |  ○   |   ●    | `TASK35` · PM-53 Head eval project (e2e liền kề)                      |
| TASK-36 | Staff không có EVALUATE → không thấy nút Evaluate / API 403                                                                                                                                                                   |  ●  |  ~  |  ○   |   ●    | `TASK36`                                                              |
| TASK-72 | CH được đánh giá task cha sau khi đã giao CM; CM không được đánh giá task đang ở hàng chờ Creative Manager (chưa giao Staff)                                                                                                  |  ●  |  ●  |  ●   |   ~    | `TestTaskMgmt_TASK72_*` · `task-72-76-…spec.ts`                       |
| TASK-73 | CM đánh giá task đã giao Staff (cả khối / task nhỏ); không đánh giá task cha đã chia nhỏ                                                                                                                                      |  ●  |  ●  |  ●   |   ~    | `TestTaskMgmt_TASK73_*` · (+ task-66 remainder)                       |
| TASK-66 | CM đánh giá task nhỏ mà nhận SL thấp hơn đã giao → hệ thống tạo task nhỏ mới cho phần còn lại. Task nhỏ đã Confirm vẫn sửa SL được; đã Hoàn thành thì khoá SL                                                                 |  ~  |  ●  |  ●   |   ○    | `task-66-…spec.ts`                                                    |
| TASK-74 | Sau khi CH đã đánh giá: CM mở task nhận → tab Evaluation thấy điểm/note của CH                                                                                                                                                |  ●  |  ●  |  ○   |   ○    | `TestTaskMgmt_TASK74_*`                                               |
| TASK-75 | Sau khi CM đã đánh giá: Staff mở task mình → tab Evaluation thấy điểm/note của CM                                                                                                                                             |  ●  |  ●  |  ○   |   ○    | `TestTaskMgmt_TASK75_*`                                               |
| TASK-76 | PM đánh giá task Creative bằng nút Evaluate trên chi tiết task; CM và CH xem điểm/%/note trên tab Evaluation của cùng task (không có màn đánh giá PM riêng)                                                                   |  ●  |  ●  |  ○   |   ○    | `TestTaskMgmt_TASK76_*` · `task-72-76-…spec.ts`                       |
| TASK-80 | Task giao nguyên: CH/PM ghi điểm gói CM, CM ghi kết quả Staff, hai điểm không đè nhau. CH thấy task trong danh sách, CM thấy task ở cả hai tab, Staff thấy task của mình. CM đọc được điểm của CH; Staff đọc được điểm của CM |  ●  |  ●  |  ●   |   ○    | `TestTaskMgmt_TASK80_*` · `task-82-dual-eval-list-visibility.spec.ts` |

### 2.6 Thêm task con sau chia (kể cả QA)

| ID      | Case                                                                                                                                                | API | E2E | Unit | Manual | Path / note                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | --------------------------------------------------------------------------------------- |
| TASK-83 | Sau khi đã chia, CM mở Sửa task cha và thêm task con số lượng 0, chưa gán Staff. SL cha không đổi; PM bị 403                                        |  ●  |  ●  |  ○   |   ●    | `TestTaskMgmt_TASK83_*` · `task-83-cm-add-zero-child.spec.ts`                           |
| TASK-84 | Lịch sử task cha ghi nhận chia nhỏ, thêm task con, đổi SL kèm lý do                                                                                 |  ●  |  ○  |  ○   |   ●    | `TestTaskMgmt_TASK84_*`                                                                 |
| TASK-85 | CM/Admin tick Task QA khi thêm task con: Type/Name = QA, level 1–5; SL QA ngoài tổng cha; thiếu qaLevel / PM thêm / vượt SL phần làm việc → từ chối |  ●  |  ●  |  ●   |   ●    | `TestTaskMgmt_TASK85_*` · `task-85-cm-add-qa-child.spec.ts` · mock `tasks.mock.test.ts` |

---

## 3. Từ chối giao

| ID      | Case                                                              | API | E2E | Unit | Manual | Path / note                                                                                                                          |
| ------- | ----------------------------------------------------------------- | :-: | :-: | :--: | :----: | ------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-64 | Creative Head từ chối nhận task từ PM → task về chờ PM xử lý      |  ●  |  ●  |  ●   |   ●    | `TASK64_CHRefuse*` · `task-64-ch-refuse-pm-handoff.spec.ts` · `TASK-64-ch-refuse-manual.md`                                          |
| TASK-77 | Creative Manager từ chối nhận → task về hàng chờ Creative Head    |  ●  |  ●  |  ●   |   ~    | `TASK77_CMRefuse*` · `task-77-cm-refuse-to-ch.spec.ts` · unit `creativePipeline` · (TASK-67 cũng cover lý do)                        |
| TASK-78 | Staff từ chối task đã giao → task về Creative Manager để giao lại |  ●  |  ●  |  ●   |   ~    | `TASK78_StaffRefuse*` · `task-78-staff-refuse-to-cm.spec.ts` · unit `creativePipeline`                                               |
| TASK-67 | Nhập lý do từ chối; lịch sử / tracker ghi nhận đúng               |  ○  |  ●  |  ○   |   ○    | `task-67-decline-reason-history-tracker.spec.ts` · `creativeDeclineApi.ts`                                                           |
| TASK-79 | Không cho từ chối trên task cha đã chia nhỏ                       |  ●  |  ●  |  ●   |   ○    | `TASK79_DeclineBlocked*` · `task-79-split-parent-no-decline.spec.ts` · unit `creativePipeline` + BE `validateCreativeDeclineRequest` |

---

## 4. Sửa task

Deadline tổng / Creative theo quyền: xem **§2.3** (TASK-70/71). Đánh giá: xem **§2.5**.

| ID         | Case                                                                             | API | E2E | Unit | Manual | Path / note                                                       |
| ---------- | -------------------------------------------------------------------------------- | :-: | :-: | :--: | :----: | ----------------------------------------------------------------- |
| TASK-07–09 | Admin / Head / người tạo được sửa thông tin task                                 |  ●  |  ○  |  ~   |   ●    | `TASK07`…`09` · `editTaskFields` / `taskStatusLock`               |
| TASK-10–11 | PM không phải người tạo / nhân viên không được sửa meta                          |  ●  |  ○  |  ●   |   ●    | `TASK10`/`11` · `canEditTaskMeta`                                 |
| TASK-12–13 | Task Hoàn thành / Hủy: không ghi được; vẫn mở xem được                           |  ●  |  ~  |  ●   |   ●    | API khoá ghi · E2E mở xem: task-68                                |
| TASK-43    | Đổi mức độ ưu tiên (urgency)                                                     |  ●  |  ○  |  ~   |   ●    | `TASK43` · `taskUrgency`                                          |
| TASK-53–54 | Số lượng trước / sau khi chia nhỏ                                                |  ●  |  ○  |  ~   |   ●    | `TASK53`/`TASK54`                                                 |
| TASK-68    | Staff mở task cha đã chia nhỏ → không có quyền; PM mở Sửa task đã xong → chỉ xem |  ●  |  ●  |  ●   |   ○    | `TASK68_SplitChildStaff*` · `task-68-…spec.ts` · `taskStatusLock` |

---

## 5. Xoá task

| ID      | Case                                 | API | E2E | Unit | Manual | Path / note                |
| ------- | ------------------------------------ | :-: | :-: | :--: | :----: | -------------------------- |
| TASK-18 | Xoá mềm task                         |  ●  |  ○  |  ○   |   ●    | `TASK18`                   |
| TASK-19 | Task đã xoá không còn xem được       |  ●  |  ○  |  ○   |   ●    | `TASK19`                   |
| TASK-20 | Nhân viên không được xoá task        |  ●  |  ○  |  ~   |   ●    | `TASK20` · `canDeleteTask` |
| TASK-21 | Creative Manager không được xoá task |  ●  |  ○  |  ~   |   ●    | `TASK21`                   |

Chưa có Playwright smoke cho xoá (API đã cover phân quyền).

---

## 6. Liên quan (cùng bộ test, ngoài CRUD)

| ID         | Case                                          | API | E2E | Notes                                                         |
| ---------- | --------------------------------------------- | :-: | :-: | ------------------------------------------------------------- |
| TASK-14–17 | Đổi trạng thái / huỷ task và khoá sau khi huỷ |  ●  |  ○  |                                                               |
| TASK-22–26 | Lọc danh sách task                            |  ●  |  ○  | TASK-46 Reset bộ lọc = thủ công còn lại                       |
| TASK-29–33 | Ai thấy task nào / đổi tài khoản (API)        |  ●  |  ○  |                                                               |
| TASK-34    | Menu bên: mục Tasks theo vai trò              |  ○  |  ●  | `task-34-sidebar-tasks.spec.ts`                               |
| TASK-35–36 | Ai được đánh giá task (tóm tắt)               |  ●  |  ~  | Chi tiết lớp đánh giá: **§2.5** · PM-53 Head eval project e2e |
| TASK-45    | Chuyển danh sách Dự án ↔ Ngoài dự án         |  ○  |  ●  | `task-45-category-nav.spec.ts`                                |

---

## Bảo trì

1. Rule sản phẩm mới trên tạo / giao / từ chối / sửa / xoá → **thêm dòng vào bảng** trước.
2. Ưu tiên **API** cho phân quyền & trạng thái; **E2E** cho giao diện; **Unit** cho helper thuần.
3. Nếu số TASK trùng → đổi tên test Go / file e2e trong cùng PR và sửa bảng này.
4. Bước thủ công giữ ở `task-mgmt-test-cases.md`; chiến lược tự động giữ ở `task-mgmt-automation.md`.
