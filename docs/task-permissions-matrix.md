# Task permissions matrix

Permission matrix for create / assign / edit / delete / list by role.  
Aligned with current FE + BE behavior (audit reference).

## Legend

| Symbol | Meaning                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------- |
| ✓      | Allowed                                                                                                 |
| △      | Allowed with conditions (see footnotes / Conditions column)                                             |
| ✗      | **Not allowed** — the role can be in this situation, but the system blocks the action                   |
| —      | **Does not use this UI/flow** — the role does not take this path, so the cell is not a permission check |

### Shared locks

- Task **finished** / **cancelled** → meta edits locked for everyone except **Admin**
- Parent with an **open revision** → parent CTAs locked

### Roles

| Short | Role             |
| ----- | ---------------- |
| Staff | Employee         |
| PM    | Project Manager  |
| CM    | Creative Manager |
| CH    | Creative Head    |
| Head  | Department Head  |
| Admin | Admin            |

---

## 1. Create / Delete / List

| Action                                   | Staff | PM  | CM  | CH  | Head | Admin |
| ---------------------------------------- | :---: | :-: | :-: | :-: | :--: | :---: |
| Create task (Project / send to Creative) |   ✗   |  ✓  |  ✗  |  ✗  |  ✗   |   ✓   |
| Delete task                              |   ✗   |  ✓  |  ✗  |  ✓  |  ✓   |   ✓   |
| View all project tasks                   |   ✗   |  ✓  |  ✗  |  ✓  |  ✓   |   ✓   |
| View only related tasks                  |   ✓   |  —  |  ✓  |  —  |  —   |   —   |
| See split children on Project Tasks      |  △¹   |  ✗  | △¹  |  ✗  |  ✗   |   ✗   |

¹ Only when the task is related to the user (assignee / creator / CM of the task, etc.).

**CM on Project Tasks** also has two tabs:

- **Task nhận** — package CH assigned to the CM
- **Task giao Staff** — already assigned to Staff / split children

---

## 2. Assign / Creative pipeline

Flow: PM creates → waiting for CH → CH assigns CM → waiting for CM → CM assigns Staff (whole or split).

| Action                       | Staff | PM  | CM  | CH  | Head | Admin | Conditions                                          |
| ---------------------------- | :---: | :-: | :-: | :-: | :--: | :---: | --------------------------------------------------- |
| Assign CM                    |   ✗   |  ✓  |  ✗  |  ✓  |  ✗   |   ✓   | Waiting for Creative Head                           |
| Assign Staff (whole / split) |   ✗   |  ✓  |  △  |  ✗  |  ✗   |   ✓   | Waiting for CM; CM must be assigned that task       |
| Change Staff / quantity      |   ✗   | △²  |  △  |  ✗  |  △   |   ✓   | Staff already assigned; enough pipeline edit rights |
| Change CM                    |   ✗   |  ✗  |  ✗  |  ✓  |  ✗   |   ✓   | Only while waiting for CM                           |
| Rehand to CH                 |   ✗   |  ✓  |  ✗  |  ✗  |  ✗   |   ✓   | CH refused; task returned to PM                     |
| CH refuse (back to PM)       |   ✗   |  ✗  |  ✗  |  ✓  |  ✗   |   ✓   | Waiting for Creative Head                           |
| CM refuse (back to CH)       |   ✗   |  ✗  |  △  |  ✗  |  ✗   |   ✓   | Waiting for CM + task assigned to that CM           |
| Staff Confirm / Decline      |   △   |  △  |  △  |  △  |  △   |   △   | User is assignee; status not updated yet            |
| Staff Finish                 |   △   |  —  |  —  |  —  |  —   |   —   | User is assignee + already Confirmed                |

² PM only when they are the **project PM** or the **task creator** (not every PM account).

---

## 3. Which edit UI?

| UI                                     |     Staff      | PM  |       CM        |        CH        |       Head       | Admin |
| -------------------------------------- | :------------: | :-: | :-------------: | :--------------: | :--------------: | :---: |
| Center modal (regular Edit task)       | △ task creator | ✓\* |        ✗        |        ✗         |        ✗         |  ✓\*  |
| Creative side drawer (Edit / reassign) |       ✗        | △²  | △ their CM task | △ waiting for CM | △ on task detail |   ✓   |
| Head center modal (Head Edit task)     |       ✗        |  ✗  |        ✗        |        ✗         |        ✓         |   ✗   |

\* PM / Admin use the **center modal** when the task is **not** opened via the Creative drawer (not: waiting for CM / assigned to Staff / split).

---

## 4. Fields in forms (when a write UI is open)

### A) Center modal — regular Edit task

| Field                                               |     Staff      | PM  | CM / CH | Head | Admin |
| --------------------------------------------------- | :------------: | :-: | :-----: | :--: | :---: |
| Name, description, qty, Deadline PM, Urgency, Staff | △ task creator |  ✓  |    —    |  —   |   ✓   |
| Deadline Creative                                   |       ✗        | △²  |    —    |  —   |   ✓   |
| Level (Design Thinking / Technical / Content)       |       ✗        |  ✓  |    —    |  —   |   ✓   |
| Status in modal                                     |       △        |  ✓  |    —    |  —   |   ✓   |
| Evaluation in modal                                 |       ✗        | ✗³  |    —    |  —   |  ✗³   |

³ Use the separate **Evaluate** action, not inline in this modal.

### B) Creative side drawer

| Field                  | Staff |      PM²       |           CM           |      CH      |     Head     |    Admin     |
| ---------------------- | :---: | :------------: | :--------------------: | :----------: | :----------: | :----------: |
| Brief / description    |   ✗   |       ✓        |           ✓            |      ✓       |      ✓       |      ✓       |
| Qty / split allocation |   ✗   |       ✓        |           ✓            |      ✗⁴      |      ✓       |      ✓       |
| Deadline PM + Urgency  |   ✗   |       ✓        |           ✗            |      ✗       |      ✓       |      ✓       |
| Deadline Creative      |   ✗   |       ✓        | △ after Staff assigned |      ✗       |      ✓       |      ✓       |
| Staff                  |   ✗   |       ✓        |           ✓            |      ✗       |      ✓       |      ✓       |
| CM                     |   ✗   |       ✗        |           ✗            |      ✓       |      ✗       |      ✓       |
| Level                  |   ✗   | △ task creator |           ✗            |      ✓       |      ✓       |      ✓       |
| Status / Evaluate      |   ✗   |  Separate CTA  |      Separate CTA      | Separate CTA | Separate CTA | Separate CTA |

⁴ CH in this drawer mainly **changes CM** while waiting for CM.

### C) Evaluate action

| Target                          | Staff | PM  | CM  | CH  | Head | Admin |
| ------------------------------- | :---: | :-: | :-: | :-: | :--: | :---: |
| Parent / handoff / whole assign |   ✗   |  ✓  | ✗⁵  |  ✓  |  ✓   |   ✓   |
| Split child                     |   ✗   |  ✗  |  ✓  |  ✗  |  ✗   |   ✓   |

⁵ CM evaluates Staff on execution work (split child / whole assign), not the CH → CM package.

---

## Glossary (plain language)

| Term                      | Meaning                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Task creator              | User who clicked Create on that task                       |
| Their CM task             | CM was assigned as Creative Manager on the task by CH      |
| Waiting for Creative Head | After PM sent the task to Creative; before CH assigns a CM |
| Waiting for CM            | After CH assigned a CM; before CM assigns Staff            |
| Assigned to Staff         | CM assigned the whole task to Staff                        |
| Split                     | CM split into child tasks (`-S1`, `-S2`, …)                |
| Project PM                | User set as PM on the task’s project                       |
