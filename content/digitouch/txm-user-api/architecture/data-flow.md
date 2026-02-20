# Data Flow

## Overview

This document describes how data moves through txm-user-api: the request lifecycle, middleware chain, data stores, and integrations with external systems. The API follows a layered architecture: **Client → Middlewares → Routes → Controllers → Services → Data Stores / External APIs**.

---

## Request Lifecycle (Middleware Chain)

Every request passes through the following pipeline. Order matters: each layer can short-circuit (e.g. reject) or enrich the request before it reaches the route handler.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. morgan          → Log request                                                 │
│ 2. cors            → Handle CORS (origin, credentials)                           │
│ 3. hpp             → Protect against HTTP Parameter Pollution                    │
│ 4. helmet          → Security headers                                            │
│ 5. compression     → Compress responses                                           │
│ 6. express.json    → Parse JSON body                                              │
│ 7. express.urlencoded → Parse form body                                          │
│ 8. cookieParser    → Parse cookies                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PATH-SPECIFIC MIDDLEWARES (app.ts)                                               │
│                                                                                  │
│ /firstLogin        → OIDC (withUserinfo: true) → res.locals.profile, userinfo    │
│ /me, /me/self,     → OIDC → res.locals.profile                                   │
│ /users/*,          → OIDC → res.locals.profile                                   │
│ /groups/*,         → Me middleware → res.locals.me (user + permissions)         │
│ /session/*        → (same as above)                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ROUTE-SPECIFIC MIDDLEWARES                                                        │
│                                                                                  │
│ /session/*         → sessionMiddleware → res.locals.sessionId (from JWT claim)   │
│ /users (POST,PUT)  → userAssignValidationMiddleware → role assignment check     │
│ /users, /groups    → validationMiddleware → DTO validation (class-validator)   │
│ /users, /groups    → permissionCheckMiddleware → Me permissions                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER → SERVICE → DATA STORE / EXTERNAL API                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ errorMiddleware    → Catch errors, log, return JSON { message }                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Sources and Destinations

| Source / Destination | Type | Used By | Purpose |
|---------------------|------|---------|---------|
| **MongoDB** | Database | Users, Groups, UserRoles | Persistent user/group data |
| **Redis** | Cache / Session store | SessionService | Session tracking (sorted sets) |
| **OIDC IdP** (Keycloak/Cognito) | External | oidcIntrospect | Token validation, userinfo |
| **Me API** | External | Me middleware | User + permissions by token |
| **Tenant API** | External | TenantService | Tenant info (e.g. defaultUserGroups) |
| **PIF API** | External | ProjectService | Remove party from projects |

---

## Route-by-Route Data Flow

### Public Routes (No Auth)

| Route | Flow |
|-------|------|
| `GET /` | IndexController → static response |
| `GET /heartbeat`, `GET /hb` | Empty 200 JSON |
| `GET /api-docs` | Swagger UI (static) |

---

### Auth: `POST /firstLogin`

```
Client (Bearer token)
    → OIDC middleware (withUserinfo: true)
        → Validates JWT via JWKS_URI
        → Fetches userinfo from USER_INFO_URI
        → res.locals.profile (JWT payload), res.locals.userinfo (sub, email, ...)
    → AuthController.firstLogIn
        → Reads { sub, email } from res.locals.userinfo
        → UserService.findUserByEmailAndUpdateSubject(email, sub)
            → MongoDB: findOne({ email }), findOneAndUpdate({ $addToSet: { subject } })
        → Returns User
```

**Data flow**: OIDC IdP (userinfo) → MongoDB (users collection). Links IdP subject to existing user by email, or returns existing user if subject already in `subject` array.

---

### Me: `GET /me`

```
Client (Bearer token)
    → OIDC middleware
        → res.locals.profile (JWT payload with sub)
    → MeController.getMe
        → sub = res.locals.profile.sub
        → MeService.findMe(sub)
            → MongoDB: userRolesModel.find({ subject })  [DB_USER_ROLES_VIEW]
        → If 404: first-login flow (userinfo → findUserByEmailAndUpdateSubject)
        → Returns UserRoles or User
```

**Data flow**: JWT `sub` → MongoDB UserRoles view. Used by internal services; supports first-login fallback.

---

### Self: `GET /me/self`

```
Client (Bearer token)
    → OIDC middleware
        → res.locals.profile
    → Me middleware
        → HTTP GET ME_API_URL (Authorization: Bearer token)
        → res.locals.me = { user, permissions }
    → MeController.getSelf
        → Returns res.locals.me
```

**Data flow**: Client token → Me API → response. No MongoDB read in controller; Me API is the source of truth for permissions.

---

### Users: `GET /users`, `POST /users`, etc.

```
Client (Bearer token)
    → OIDC middleware → res.locals.profile
    → Me middleware → res.locals.me (organizationId, permissions)
    → permissionCheckMiddleware(permissions.getUsers, etc.)
    → [POST/PUT] userAssignValidationMiddleware
        → Checks res.locals.me.permissions for users.assign.role.*
        → Validates req.body.role against assignable roles
    → [POST/PUT] validationMiddleware(CreateUserDto)
    → UsersController
        → organizationId = res.locals.me.organizationId
        → UserService (findUsers, createUser, updateUser, deleteUser)
            → MongoDB: DB_USERS_COLLECTION
```

**Data flow**: `organizationId` from Me API scopes all queries. Request body (DTO) → MongoDB. Response: `{ data, message }`.

---

### Groups: `GET /groups`, `POST /groups`, etc.

```
Client (Bearer token)
    → OIDC + Me middleware → res.locals.me
    → permissionCheckMiddleware
    → validationMiddleware (CreateGroupDto, UpdateGroupUsersDto)
    → GroupsController
        → organizationId = res.locals.me.organizationId
        → GroupService, UserService
            → MongoDB: DB_USERS_COLLECTION (groups are type: 'group')
```

**Special case — deleteGroup**:
```
GroupsController.deleteGroup
    → TenantService.getUserTenant(req.headers)
        → HTTP GET TENANT_API_URL/tenant (Authorization, x-tenant-id)
        → Returns { defaultUserGroups }
    → If groupId in defaultUserGroups → 409
    → ProjectService.removePartyFromProjects(groupId, headers)
        → HTTP PATCH PIF_API_URL/projectsRemoveParty { partyId }
    → UserService.removeAllUsersFromGroup, GroupService.deleteGroup
        → MongoDB: update users (party), delete group
```

**Data flow**: Me API (org + permissions) → Tenant API (tenant, defaultUserGroups) → PIF API (remove party) → MongoDB (users, groups).

---

### Session: `POST /session/_start`, `GET /session`, etc.

```
Client (Bearer token)
    → OIDC middleware → res.locals.profile
    → Me middleware → res.locals.me (includes _id, maxSessionNum)
    → sessionMiddleware
        → sessionId = res.locals.profile[SESSION_JWT_CLAIM]  (e.g. jti, origin_jti)
        → res.locals.sessionId = sessionId
    → SessionController (start, polling, override, logout)
        → SessionService
            → Redis: key = {prefix}:sessions:{userId}
            → Sorted set: score = timestamp, value = sessionId
```

**Redis data structure**:
- Key: `{REDIS_KEY_PREFIX}:sessions:{userId}` (e.g. `dev:sessions:507f1f77bcf86cd799439011`)
- Type: Sorted set (ZADD)
- Score: Unix timestamp (ms)
- Value: sessionId (from JWT claim)
- TTL: SESSION_KEY_EXPIRE_SECONDS
- Logic: Only `maxSessionNum` sessions allowed in last `SESSION_TIME_LIMIT_SECONDS` window

**Data flow**: JWT (profile, session claim) + Me (userId) → Redis. No MongoDB for session state.

---

## Data Stores Detail

### MongoDB

| Collection / View | Config | Purpose |
|------------------|--------|---------|
| Users | `DB_USERS_COLLECTION` | Users (type: `user`) and groups (type: `group`) |
| UserRoles | `DB_USER_ROLES_VIEW` | View with users + permissions (joined from Me API or similar) |

**User document shape** (from `users.model.ts`):
- `username`, `email`, `displayName`, `organizationId`, `type`, `subject[]`, `party[]`, `role[]`, `status`, `maxSessionNum`

**Group** (same collection, `type: 'group'`):
- `displayName`, `organizationId`, `type`, `status`

### Redis

| Key Pattern | Type | Purpose |
|-------------|------|---------|
| `{prefix}:sessions:{userId}` | Sorted set | Active sessions per user; score = timestamp, value = sessionId |

---

## External API Integrations

| API | URL Config | Purpose |
|-----|------------|---------|
| **OIDC IdP** | `JWKS_URI`, `USER_INFO_URI` | Token validation, userinfo |
| **Me API** | `ME_API_URL` | User + permissions by Bearer token |
| **Tenant API** | `TENANT_API_URL` | `GET /tenant` → tenant, defaultUserGroups |
| **PIF API** | `PIF_API_URL` | `PATCH /projectsRemoveParty` → remove party from projects |

**Headers forwarded** to Tenant and PIF APIs:
- `Authorization` (Bearer token)
- `x-tenant-id` (if present)

---

## Response Format

All successful API responses follow this pattern:

```json
{
  "data": <object | array>,
  "message": "<string>"
}
```

Session endpoints use a different format:

```json
{
  "status": "OK" | "ERROR",
  "data": { "sessionId": "..." },
  "code": "SESSION_STARTED" | "SESSION_LIMIT_EXCEEDED" | ...
}
```

Error responses:

```json
{
  "message": "<error message>"
}
```

---

## Context Propagation (res.locals)

| Key | Set By | Contains |
|-----|--------|----------|
| `profile` | OIDC middleware | JWT payload (sub, jti, etc.) |
| `userinfo` | OIDC middleware (withUserinfo) | Userinfo from IdP (sub, email, etc.) |
| `me` | Me middleware | User + permissions from Me API |
| `sessionId` | sessionMiddleware | JWT claim value (e.g. jti) |

---

## Trade-offs

- **Me API as source of permissions**: Permissions are not stored in txm-user-api; they come from Me API. This centralizes permission logic but adds a network dependency.
- **Redis for sessions**: Sessions are not persisted in MongoDB. Redis failure affects session start/polling but not user data.
- **Organization scoping**: All user/group queries are scoped by `organizationId` from Me API. No cross-org access.
- **Tenant API for group deletion**: Deleting a group requires Tenant API (defaultUserGroups) and PIF API (remove party). Multiple external calls add latency and failure points.
