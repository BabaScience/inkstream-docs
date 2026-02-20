# txm-user-api: Documentation Scan and Plan

## Context

This document captures the results of scanning the `txm-user-api` project and proposes a full documentation structure aligned with InkStreamCLI conventions (`docs/architecture/`, `docs/workflows/`, `docs/api/`, `docs/notes/`, `docs/decisions/`).

---

## Project Overview (from scan)

**txm-user-api** is a TypeScript + Express REST API that provides:

- **User and group management** (CRUD, membership)
- **Identity integration** via OIDC/Keycloak (first-login, token introspection)
- **Session management** with Redis (start, polling, override, logout)
- **Me/Self endpoints** for current user and permissions
- **Heartbeat** for health checks

**Stack**: Express, MongoDB (Mongoose), Redis, OIDC Introspect, Swagger, PM2.

---

## Current Documentation State

| Location | Content |
|----------|---------|
| `docs/AGENTS.md` | Rules for docs editing, folder structure, URL mapping |
| `swagger.yaml` | OpenAPI spec for Users, Groups, Me, Self (no Auth/Session) |
| `docs/` subfolders | **Empty** — no `architecture/`, `workflows/`, `api/`, `decisions/` yet |

---

## Proposed Documentation Structure

### 1. Architecture (`docs/architecture/`)

| File | Purpose |
|------|---------|
| `high-level.md` | Overview, components (Express, MongoDB, Redis, OIDC, Me API), integration points |
| `data-flow.md` | Request flow: OIDC → Me → routes; session lifecycle; data stores |
| `deployment.md` | PM2, env vars, build, production setup |

### 2. Workflows (`docs/workflows/`)

| File | Purpose |
|------|---------|
| `auth-flow.md` | First-login flow, OIDC middleware, user creation/update |
| `session-lifecycle.md` | Session start → polling → override/logout; Redis keys, limits |
| `docs-pipeline.md` | How InkStreamCLI syncs docs to central site |
| `local-development.md` | Prerequisites, env setup, run dev, run tests |

### 3. API (`docs/api/`)

| File | Purpose |
|------|---------|
| `endpoints-overview.md` | Route summary, auth requirements, base paths |
| `users.md` | Users CRUD, DTOs, permissions |
| `groups.md` | Groups CRUD, addUsers/removeUsers |
| `me-and-self.md` | `/me`, `/me/self` differences, UserRoles |
| `auth.md` | `POST /firstLogin` |
| `session.md` | `POST /session/_start`, `GET /session`, `PUT /session/_override`, `POST /session/_logout` |
| `heartbeat.md` | `/heartbeat`, `/hb` |

### 4. Decisions (`docs/decisions/`)

| File | Purpose |
|------|---------|
| `YYYY-MM-DD-oidc-auth.md` | Why OIDC/Keycloak instead of custom auth |
| `YYYY-MM-DD-redis-sessions.md` | Why Redis for session tracking |
| `YYYY-MM-DD-me-api-integration.md` | Why external Me API for permissions |

### 5. Notes (`docs/notes/`)

| File | Purpose |
|------|---------|
| `documentation-scan-and-plan.md` | This file — scan results and plan |
| `env-variables.md` | Reference of all env vars from config |

---

## Key Components (for architecture docs)

### Routes and paths

| Path | Methods | Auth | Purpose |
|------|---------|------|---------|
| `/` | GET | — | Index |
| `/firstLogin` | POST | OIDC (with userinfo) | First login, create/update user |
| `/me` | GET | OIDC | Current user (UserRoles) |
| `/me/self` | GET | OIDC + Me | Self with permissions |
| `/users` | GET, POST | OIDC + Me + permissions | Users CRUD |
| `/users/:id` | GET, PUT, DELETE | OIDC + Me + permissions | User by ID |
| `/groups` | GET, POST | OIDC + Me + permissions | Groups CRUD |
| `/groups/:id` | GET, PUT, DELETE | OIDC + Me + permissions | Group by ID |
| `/groups/:id/addUsers` | PATCH | OIDC + Me + permissions | Add users to group |
| `/groups/:id/removeUsers` | PATCH | OIDC + Me + permissions | Remove users |
| `/session/_start` | POST | OIDC + Me + session claim | Start session |
| `/session` | GET | OIDC + Me + session claim | Polling (refresh) |
| `/session/_override` | PUT | OIDC + Me + session claim | Override session limit |
| `/session/_logout` | POST | OIDC + Me + session claim | Logout session |
| `/heartbeat`, `/hb` | GET | — | Health check |

### External integrations

- **OIDC (Keycloak)**: JWKS, userinfo; token validation via `@techvisory/oidc-introspect`
- **Me API** (`ME_API_URL`): Permissions and user context via `@techvisory/me`
- **MongoDB**: Users, groups, UserRoles view
- **Redis**: Session tracking (sorted sets by user, TTL)

### Env variables (from config)

- `NODE_ENV`, `PORT`, `CREDENTIALS`, `ORIGIN`
- `DB_*`, `DB_URI_CONNECTION`, `DB_USERS_COLLECTION`, `DB_USER_ROLES_VIEW`
- `JWKS_URI`, `USER_INFO_URI`, `ME_API_URL`, `TENANT_API_URL`, `PIF_API_URL`
- `REDIS_*`, `SESSION_*`, `SECRET_KEY`
- `LOG_FORMAT`, `LOG_DIR`

---

## Implementation Order

1. **Architecture** — `high-level.md`, `data-flow.md` (foundation)
2. **API** — `endpoints-overview.md`, then `users.md`, `groups.md`, `me-and-self.md`, `auth.md`, `session.md`
3. **Workflows** — `auth-flow.md`, `session-lifecycle.md`, `local-development.md`
4. **Decisions** — ADRs as needed
5. **Deployment** — `deployment.md` in architecture

---

## Gaps Identified

- Swagger does not document Auth (`firstLogin`) or Session endpoints
- `downloadConfig.ts` uses WellKnownDiscovery for OIDC config — not documented
- Permissions model (`users.read`, `groups.read`, etc.) — document in API
- `userAssignValidation` middleware — document in workflows/architecture

---

## Next Steps

1. Create `docs/architecture/`, `docs/workflows/`, `docs/api/`, `docs/decisions/` if missing
2. Implement docs in the order above
3. Optionally extend `swagger.yaml` with Auth and Session paths
4. Add `docs/notes/env-variables.md` as env reference
