# Permissions Model

## Context

txm-ui uses a permission-based model to gate UI elements. Permissions come from the User API (`/me/self`) and are stored in sessionStorage. The `usePermissions` hook exposes boolean flags for each gated feature.

---

## Data Flow

1. **getMe** (GET `/me/self`) returns user with `permissions` array.
2. User stored in `sessionStorage.USER_DATA`.
3. **usePermissions** reads `userData?.permissions`.
4. `hasAllPermissions(arr)` checks if user has every permission in the array.
5. Components use flags like `showCreateProjectButton`, `showUsersTab`.

---

## Permission Constants

From `src/models/UserPermissions.ts` (Permissions enum):

### Projects
- `projects.read`, `projects.create`, `projects.update`, `projects.delete`, `projects.share`

### Items
- `items.read`, `items.read.summary`, `items.create`, `items.create-inline`, `items.compare`, `items.textdiff`
- `items.update`, `items.delete`, `items.assign`, `items.deassign`
- `items.assign.master`, `items.deassign.master`, `items.generate.report`, `items.analysis.restart`

### Findings
- `findings.read`, `findings.create`, `findings.update`, `findings.delete`

### Users
- `users.read`, `users.create`, `users.update`, `users.delete`
- `users.assign.role.OPS`, `users.assign.role.ADMIN`

### Groups
- `groups.read`, `groups.create`, `groups.update`, `groups.delete`
- `groups.add.users`, `groups.remove.users`

### Analyzers
- `analyzers.read`, `analyzers.read.secure`, `analyzers.create`, `analyzers.update`, `analyzers.delete`

### Dashboard & Search
- `dashboard.view`, `dashboard.view.old`, `searchbar.view`

### Other
- `rulexecs.read.matches`, `rulexecs.exec.rbe`, `chats.use`

---

## UI Gating Flags

From `usePermissions`:

| Flag | Permissions Required |
|------|----------------------|
| showUsersTab | USERS_READ |
| showCreateProjectButton | PROJECTS_CREATE, ANALYZERS_READ |
| showCreateBatchButton | PROJECTS_CREATE, ITEMS_CREATE_INLINE, ANALYZERS_READ |
| showShareProjectButton | PROJECTS_UPDATE, PROJECTS_SHARE |
| showDeleteProjectButton | PROJECTS_DELETE |
| showCompareButton | ITEMS_COMPARE |
| showTextDiffButton | ITEMS_TEXTDIFF |
| showArchiveButton | DASHBOARD_VIEW, SEARCHBAR_VIEW |
| showRestartAnalysisButton | ITEMS_ANALYSIS_RESTART |
| isAssignMaster | ITEMS_ASSIGN_MASTER |
| isDeassignMaster | ITEMS_DEASSIGN_MASTER |
| showVerifyButton | ITEMS_READ_SUMMARY |
| showCreateItemButton | ITEMS_CREATE |
| showEditItemButton | ITEMS_UPDATE |
| showDeleteItemButton | ITEMS_DELETE |
| showCreateUserButton | USERS_CREATE |
| showCreateGroupButton | GROUPS_CREATE |
| showDashboardButton | DASHBOARD_VIEW_OLD |
| showDashboardSearchbar | SEARCHBAR_VIEW |
| showReportDownloadButton | ITEMS_GENERATE_REPORT |
| showChat | CHATS_USE |

---

## Role Assignment

For user/group management, `users.assign.role.*` permissions control which roles a user can assign. Example: `users.assign.role.OPS` allows assigning the OPS role. The `userAssignValidation` middleware (backend) enforces this.

---

## Key Files

- `src/infrastructure/hooks/usePermissions.ts` — Permission flags
- `src/models/UserPermissions.ts` — Permissions enum
