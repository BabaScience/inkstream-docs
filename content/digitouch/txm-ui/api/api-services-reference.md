# API Services Reference

## Context

Brief reference for the API methods exposed by each service built in `useApi`. See `src/api/services/*.ts` for implementation.

---

## User API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| getMe | GET /me/self | Current user + permissions |
| setUserSubject | POST /firstLogin | First-login; link IdP subject to user |
| getUserById | GET /users/:userId | User by ID |
| createUser | POST /users | Create user |
| getParties | GET /users | All parties (users + groups) |
| updateParty | PUT /users/:partyId | Update party |
| getUsers | GET /users?type=user | All users |
| getGroups | GET /groups | All groups |
| getGroupUsers | GET /users?party=:groupId | Users in group |
| createGroup | POST /groups | Create group |
| addUsersToGroup | PATCH /groups/:id/addUsers | Add users to group |
| removeUsersFromGroup | PATCH /groups/:id/removeUsers | Remove users |
| deleteGroup | DELETE /groups/:id | Delete group |

---

## Session API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| startSession | POST /session/_start | Start session |
| checkSession | GET /session | Poll session validity |
| overrideSession | PUT /session/_override | Override session limit |
| endSession | POST /session/_logout | End session |

---

## PIF API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| getProjects | GET /projects | List projects |
| getManagedProjects | GET /projects?isManaged=true | Managed projects |
| getProjectById | GET /projects/:id | Project by ID |
| getProjectByIds | GET /projectsByIds?ids=... | Projects by IDs |
| createProject | POST /projects | Create project |
| updateProject | PUT /projects/:id | Update project |
| deleteProject | DELETE /projects/:id | Delete project |
| getItems | GET /projects/:id/items | Items in project |
| createItem | POST /projects/:id/items | Create item |
| getFindings | GET /projects/:id/items/:itemId/findings | Findings |
| ... | ... | (See pif-api.ts for full list) |

---

## Tenant API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| getTenants | GET /tenant | User tenants |
| getUserTenant | GET /tenant | Current tenant (with x-tenant-id) |

---

## Other APIs

- **Analyzer API** — Analyzers CRUD
- **Omnia API** — Omnia search
- **LOV API** — List-of-values, landing cards, home page cards
- **Dashboard API** — Analytics, charts
- **Chat API** — Chat to document
- **Form API** — Form composition
- **Feedback API** — Feedback export
- **Ruleset API** — Rules
- **Template API** — Templates
- **Aigen API** — AI generation
