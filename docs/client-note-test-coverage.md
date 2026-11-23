# Client Note (Knowledge) — test coverage

Rules: [Ghi chú client](../docs-site/docs/client-knowledge.md) (Docusaurus `/clients/knowledge`).

Permission: **`EDIT_CLIENT_NOTE`** (PM, CM, CH, Head, Admin). View: **`MANAGE_PROJECTS`**.

| Case           | Rule                                    | Layer | Location                                               |
| -------------- | --------------------------------------- | ----- | ------------------------------------------------------ |
| **CLIENT-32**  | PM tạo note → 201                       | API   | `client_mgmt_test.go`                                  |
| **CLIENT-32b** | CM + CH tạo note → 201                  | API   | idem                                                   |
| **CLIENT-32c** | Employee list notes → 200               | API   | idem                                                   |
| **CLIENT-32d** | Head tạo note → 201                     | API   | idem                                                   |
| **CLIENT-39**  | Employee create/patch/delete → 403      | API   | idem                                                   |
| **CLIENT-31**  | Admin tạo note (baseline)               | API   | idem                                                   |
| **CLIENT-44**  | UI: PM/CM thấy Add note; Employee không | E2E   | `e2e/clients/client-44-knowledge-note-by-role.spec.ts` |
