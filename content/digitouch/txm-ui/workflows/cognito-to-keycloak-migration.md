# Frontend: Migration from Cognito to Keycloak

## Context

txm-ui uses @axa-fr/react-oidc for authentication. The OIDC configuration (authority, client_id, redirect_uri) is driven by Wellknown or local env. Migrating from AWS Cognito to Keycloak requires updating these configuration values; no application code changes are needed for the core auth flow.

---

## Pre-requisites

- Keycloak deployed with realm and client configured
- Keycloak client has Valid Redirect URIs including `{origin}/authentication/callback`
- Keycloak Web Origins allow your frontend origin
- Coordination with backend (txm-user-api) migration

---

## Environment Variables to Update

| Variable | Cognito (before) | Keycloak (after) |
|----------|------------------|------------------|
| `REACT_APP_AUTHORITY_URI` | `https://cognito-idp.{region}.amazonaws.com/{userPoolId}` | `https://{keycloak-base}/realms/{realm}` |
| `REACT_APP_CLIENTID` | Cognito app client ID | Keycloak client ID |
| `REACT_APP_LOGOUT_URI` | Cognito logout URL | `https://{keycloak-base}/realms/{realm}/protocol/openid-connect/logout` |

**Example Keycloak values:**
```env
REACT_APP_AUTHORITY_URI=https://keycloak.example.com/realms/txm
REACT_APP_CLIENTID=txm-ui
REACT_APP_LOGOUT_URI=https://keycloak.example.com/realms/txm/protocol/openid-connect/logout
```

---

## OIDC Config in App.tsx

The OIDC config is built from WellknownVars (or process.env when `REACT_APP_USE_LOCAL_ENV=true`):

```javascript
const oidcConfig = {
  client_id: REACT_APP_CLIENTID,
  redirect_uri: window.location.origin + "/authentication/callback",
  scope: "email openid",
  authority: REACT_APP_AUTHORITY_URI,
  service_worker_only: false,
  refresh_time_before_tokens_expiration_in_second: 200,
};
```

- **authority**: Must point to Keycloak realm URL (no trailing path).
- **redirect_uri**: Must match Keycloak client Valid Redirect URIs.
- **scope**: Keycloak supports `openid`, `email`, `profile`; adjust if needed.

---

## Logout Flow

`useAuth.logout` uses `cognitoLogout` (in AuthUtils.ts) which redirects to `REACT_APP_LOGOUT_URI` with query params. Keycloak logout typically expects:

- `post_logout_redirect_uri` — Where to redirect after logout
- `client_id` — Keycloak client ID

The current `cognitoLogout` uses `logout_uri`, `redirect_uri`, `client_id`, `response_type`. If Keycloak requires different param names, `AuthUtils.ts` may need a small update (e.g. `post_logout_redirect_uri` instead of `logout_uri`). Verify against Keycloak logout documentation.

---

## Wellknown Updates

If production config comes from Wellknown API, ensure the Wellknown response includes the Keycloak values for:

- `REACT_APP_AUTHORITY_URI`
- `REACT_APP_CLIENTID`
- `REACT_APP_LOGOUT_URI`

---

## Validation Checklist

| Test | Expected |
|------|----------|
| Login redirect | Redirects to Keycloak login page |
| Callback | Returns to app with tokens |
| Token refresh | Tokens refresh before expiry |
| Logout | Redirects to Keycloak logout, then back to app |
| Session start | POST /session/_start succeeds |
| getMe | GET /me/self returns user |

---

## Rollback

Revert env vars (or Wellknown) to Cognito values and redeploy. Clear browser sessionStorage/cookies if needed.

---

## Related Documentation

- [Auth and session flow](auth-and-session-flow.md)
- Backend migration: see txm-user-api `docs/workflows/cognito-to-keycloak-migration.md`
