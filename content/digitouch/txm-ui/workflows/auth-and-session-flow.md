# Auth and Session Flow

## Context

txm-ui uses OpenID Connect (OIDC) for authentication and the User API for session management. This document describes the step-by-step flows for login, first-login, session lifecycle, and error handling.

---

## Pre-requisites

- Wellknown configuration loaded (from API or local env)
- OIDC IdP configured: `REACT_APP_CLIENTID`, `REACT_APP_AUTHORITY_URI`
- User API reachable for `/firstLogin`, `/me/self`, `/session/*`

---

## Login Flow

1. User navigates to a protected route (e.g. `/home`) or `/login`.
2. **OidcSecure** (inside AuthorizedRoute) checks auth state.
3. If not authenticated, OIDC redirects to IdP (Cognito/Keycloak).
4. User enters credentials at IdP.
5. IdP redirects to `/authentication/callback` with authorization code.
6. @axa-fr/react-oidc exchanges code for tokens; stores them.
7. **AuthorizedRoute** renders children; **useSession** runs.
8. **useSession** sees `user` (from usePermissions) and no `SESSION_ID`.
9. **startSession** is called: POST `/session/_start` with Bearer token.
10. On success, `sessionId` stored in `sessionStorage.SESSION_ID`.
11. **checkSession** starts polling GET `/session` at `REACT_APP_SESSION_REFRESH_INTERVAL` (default 30s).

---

## First-Login Flow

When a user logs in for the first time (not yet in User API):

1. **usePermissions** runs `getMe` (GET `/me/self`).
2. User API returns 404 (user not found by subject).
3. `meError` is set; `setUserSubject` query is enabled.
4. **setUserSubject** (POST `/firstLogin`) is called with Bearer token.
5. User API receives `sub` and `email` from userinfo; creates/updates user.
6. On success: if `data.endDate` is in the past → redirect to `/inactive-user`; else `refetch` getMe.
7. getMe succeeds; user and permissions stored in `sessionStorage.USER_DATA`.
8. On error → redirect to `/offline-page`.

---

## Session Lifecycle

### Start

- Triggered when `user` exists and `sessionStorage.SESSION_ID` is empty.
- POST `/session/_start`.
- 200: store `data.sessionId` in sessionStorage.
- 409 (SESSION_LIMIT_EXCEEDED): `showSessionModal` (override or logout).

### Polling

- GET `/session` at interval (e.g. 30s).
- 200: session valid; no action.
- 409 (SESSION_TERMINATED): `handleSessionError` → logout → redirect to `/session-aborted`.

### Override

- User clicks "Override" in session modal.
- PUT `/session/_override`.
- On success: new `sessionId` stored; modal closed.
- On error: logout.

### Logout

- User clicks "Cancel" in modal, or explicit logout.
- POST `/session/_logout` (if sessionId exists).
- OIDC logout; `cognitoLogout` redirects to IdP logout URL.
- `cleanSessionStorage` clears all sessionStorage keys.

---

## Inactive User

- When `setUserSubject` returns user with `endDate` in the past.
- Redirect to `/inactive-user`.
- User sees InactiveUser page; cannot proceed.

---

## Offline

- When `setUserSubject` fails (e.g. network error).
- Redirect to `/offline-page`.
- User can retry or contact support.

---

## Session Aborted

- When `checkSession` returns 409 and user chooses logout (or auto-logout).
- Redirect to `/session-aborted`.
- User can log in again (new session).

---

## Key Files

- `src/components/auth/AuthorizedRoute.tsx` — OidcSecure + useSession
- `src/infrastructure/hooks/useSession.ts` — startSession, checkSession
- `src/infrastructure/hooks/useSessionModal.tsx` — override modal
- `src/infrastructure/hooks/usePermissions.ts` — getMe, setUserSubject
- `src/api/services/session-api.ts` — session API calls
- `src/infrastructure/hooks/useAuth.ts` — logout
