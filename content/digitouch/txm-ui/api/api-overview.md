# API Integration Overview

## Context

txm-ui integrates with multiple backend APIs. All API access is centralized through `useApi`, which builds service modules with a token-authenticated fetch function.

---

## How useApi Works

1. **WellknownVars** — API base URLs come from Wellknown (or local env when `REACT_APP_USE_LOCAL_ENV=true`).
2. **fetchWithToken** — `useOidcFetch` wraps `customFetch`; automatically adds:
   - `Authorization: Bearer <idToken>`
   - `x-tenant-id: <storedTenantId>` (if tenant selected)
   - `Content-Type: application/json` (for JSON bodies)
3. **buildXxxApi** — Each service is a function `(url, fetchWithToken) => { ... }` that returns an object of API methods.

---

## fetchWithToken Flow

```
useApi() → useOidcFetch(customFetch) → customFetch(url, options)
```

- **useOidcFetch**: Injects current OIDC token; handles token refresh.
- **customFetch**: Wraps `fetch`; serializes JSON body; validates status (throws on non-2xx by default).

---

## API Services

| Service | Config Key | Purpose |
|---------|------------|---------|
| user-api | REACT_APP_USER_API_URL | Users, groups, me, firstLogin |
| session-api | REACT_APP_USER_API_URL | Session start, check, override, logout |
| pif-api | REACT_APP_PIF_API_URL | Projects, items, findings |
| tenant-api | REACT_APP_TENANT_API_URL | Tenants |
| analyzer-api | REACT_APP_ANALYZER_API_URL | Analyzers |
| omnia-api | REACT_APP_OMNIA_API_URL | Omnia search |
| lov-api | REACT_APP_LOV_API_URL | List-of-values, landing cards |
| dashboard-api | REACT_APP_DASHBOARD_API_URL | Analytics |
| chat-api | REACT_APP_CHAT_API_URL | Chat |
| form-api | REACT_APP_FORM_API_URL | Forms |
| feedback-api | REACT_APP_FEEDBACK_API_URL | Feedback export |
| ruleset-api | REACT_APP_RULE_API_URL | Rules |
| rulexec-api | REACT_APP_RULEXEC_API_URL | Rule execution |
| template-api | REACT_APP_TEMPLATE_API_URL | Templates |
| aigen-api | REACT_APP_AIGEN_API_URL | AI generation |
| agent-service-api | REACT_APP_AGENT_SERVICE_API_URL | Agent service |

---

## Response Format

Backend APIs typically return:

```json
{
  "data": <object | array>,
  "message": "<string>"
}
```

Session endpoints may return:

```json
{
  "status": "OK",
  "data": { "sessionId": "..." },
  "code": "SESSION_STARTED"
}
```

Components usually destructure `data` from the response.

---

## Error Handling

- **FetchError** — Thrown by customFetch when status is not 2xx. Has `status`, `message`, `response`.
- **React Query** — Handles retries, `onError`; components can use `isError`, `error` from `useQuery`/`useMutation`.
- **useErrorModal** — Context for showing error modals.

---

## Key Files

- `src/api/useApi.ts` — useApi hook, builds all services
- `src/api/custom-fetch.ts` — customFetch implementation
- `src/api/fetch-error.ts` — FetchError class
- `src/api/services/*.ts` — Individual API modules
