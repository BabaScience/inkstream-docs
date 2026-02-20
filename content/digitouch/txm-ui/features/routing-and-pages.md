# Routing and Pages

## Context

txm-ui uses React Router v6 with a central `Routes` enum. Most routes require authentication via `AuthorizedRoute`; a few are public.

---

## Route Enum

From `src/infrastructure/routing/Routes.ts`:

| Route | Path | Auth |
|-------|------|------|
| Home | /home | Yes |
| Login | /login | No |
| Profile | /profile | Yes |
| SelectTenant | /tenants | Yes |
| SelectTenantLanding | /select-tenant | Yes |
| Settings | /settings | Yes |
| ManageAdminMenu | /manageAdminMenu | Yes |
| Parties | /settings/parties | Yes |
| UserDetails | /settings/parties/users/:userId | Yes |
| GroupDetails | /settings/parties/groups/:groupId | Yes |
| FeedbackExport | /settings/export/feedbacks | Yes |
| OmniaSearchExport | /settings/export/omniasearch | Yes |
| Projects | /home/projects | Yes |
| Items | /home/projects/:projectId/items | Yes |
| Findings | /home/projects/:projectId/items/:itemId/findings | Yes |
| ProjectAnalysis | /home/projects/:projectId/analysis | Yes |
| ItemAnalysis | /home/projects/:projectId/items/:itemId/analysis | Yes |
| RelatedItems | /home/projects/:projectId/items/:itemId/related | Yes |
| RelatedItemFindings | /home/projects/:projectId/items/:itemId/related/:relatedProjectId/:relatedItemId/findings | Yes |
| RulesetEditor | /settings/rule | Yes |
| ComparedMatches | /home/projects/:projectId/comparedmatches | Yes |
| ComparedMatchesDetails | /home/comparedmatchesdetails | Yes |
| LovSearch | /home/projects/:projectId/lovsearch | Yes |
| OmniaSearch | /home/projects/:projectId/omniaSearch | Yes |
| Presearch | /home/projects/:projectId/presearch | Yes |
| RelatedOmniaSearch | /home/projects/:projectId/items/:itemId/related/omniaSearch | Yes |
| ChatMatches | /home/chats/:chatId | Yes |
| TextDiff | /home/textdiff | Yes |
| Templates | /settings/templates | Yes |
| FormList | /forms | Yes |
| FormComposition | /forms/:formId | Yes |
| OfflinePage | /offline-page | No |
| InactiveUser | /inactive-user | No |
| SessionAborted | /session-aborted | No |
| Typography | /typography | No |
| Components | /components | No |

---

## Page Hierarchy

```
/select-tenant (landing)
    → /home (landing page with cards)
    → /home/projects
        → /home/projects/:projectId/items
            → /home/projects/:projectId/items/:itemId/findings
            → /home/projects/:projectId/items/:itemId/analysis
            → /home/projects/:projectId/items/:itemId/related
            → ...
        → /home/projects/:projectId/analysis
        → /home/projects/:projectId/omniaSearch
        → /home/projects/:projectId/presearch
        → ...

/settings
    → /settings/parties (users & groups)
        → /settings/parties/users/:userId
        → /settings/parties/groups/:groupId
    → /settings/templates
    → /settings/rule
    → /settings/export/feedbacks
    → /settings/export/omniasearch
```

---

## Public vs Authorized

- **Public**: Login, OfflinePage, InactiveUser, SessionAborted, Typography, Components
- **Authorized**: All others wrapped in `<AuthorizedRoute>`

---

## Default Redirect

Unknown paths (`*`) redirect to `/select-tenant`.

---

## Permission-Gated UI

Routes are not permission-gated at the route level; instead, `usePermissions` provides flags (e.g. `showCreateProjectButton`, `showUsersTab`) that components use to show/hide UI elements. Users without permission see reduced UI but can still navigate to routes (backend enforces authorization).
