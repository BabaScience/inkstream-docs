# Migration from AWS Cognito to Keycloak

## Context

txm-user-api currently uses **AWS Cognito** as the identity provider (IdP) for OIDC-based authentication. The migration moves to **Keycloak**, which is already deployed and endpoints are available. The API uses `@techvisory/oidc-introspect` for token validation and userinfo — it is **OIDC-agnostic**, so no application code changes are required. The migration is primarily a configuration and deployment change.

---

## Pre-requisites

- [ ] Keycloak instance deployed and reachable
- [ ] Keycloak realm and client(s) configured for the application
- [ ] Keycloak endpoints documented:
  - Base URL (e.g. `https://keycloak.example.com`)
  - Realm name (e.g. `txm` or `master`)
  - JWKS URI
  - UserInfo URI
  - OpenID Configuration URI (for WellKnownDiscovery)
- [ ] Access to environment configuration (`.env.*.local`, deployment config)
- [ ] Coordination with frontend team (login/logout URLs change)

---

## Keycloak Endpoint Reference

| Endpoint | URL Pattern | Example |
|----------|-------------|---------|
| OpenID Configuration | `{base}/realms/{realm}/.well-known/openid-configuration` | `https://keycloak.example.com/realms/txm/.well-known/openid-configuration` |
| JWKS (certs) | `{base}/realms/{realm}/protocol/openid-connect/certs` | `https://keycloak.example.com/realms/txm/protocol/openid-connect/certs` |
| UserInfo | `{base}/realms/{realm}/protocol/openid-connect/userinfo` | `https://keycloak.example.com/realms/txm/protocol/openid-connect/userinfo` |
| Token | `{base}/realms/{realm}/protocol/openid-connect/token` | `https://keycloak.example.com/realms/txm/protocol/openid-connect/token` |
| Authorization | `{base}/realms/{realm}/protocol/openid-connect/auth` | `https://keycloak.example.com/realms/txm/protocol/openid-connect/auth` |

---

## Migration Steps

### Step 1: Verify Keycloak Configuration

1. Confirm Keycloak realm and client exist.
2. Ensure the client has:
   - **Access Type**: `confidential` (if using client secret) or `public` (for SPA)
   - **Valid Redirect URIs**: Include your frontend and API callback URLs
   - **Web Origins**: CORS for your frontend origin
3. Verify JWKS and UserInfo endpoints respond:
   ```bash
   curl -s https://{keycloak-base}/realms/{realm}/protocol/openid-connect/certs | jq .
   curl -s -H "Authorization: Bearer <token>" https://{keycloak-base}/realms/{realm}/protocol/openid-connect/userinfo
   ```

### Step 2: Configure JWT Claims for Session Management

The API expects a session identifier in the JWT. It uses `SESSION_JWT_CLAIM` (default: `origin_jti`).

- **Cognito**: May use `jti` or a custom claim.
- **Keycloak**: Provides `jti` (JWT ID) by default. If your setup used `origin_jti`, configure a Keycloak **Protocol Mapper** to add it:
  - Mapper type: **User Attribute** or **Hardcoded claim**
  - Claim name: `origin_jti`
  - Value: `jti` or a unique session identifier

Alternatively, set `SESSION_JWT_CLAIM=jti` in your environment to use Keycloak’s built-in `jti` claim.

### Step 3: Update Environment Variables

Update the following in `.env.development.local`, `.env.production.local`, or your deployment config:

| Variable | Cognito (before) | Keycloak (after) |
|----------|------------------|------------------|
| `JWKS_URI` | `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json` | `https://{keycloak-base}/realms/{realm}/protocol/openid-connect/certs` |
| `USER_INFO_URI` | Cognito UserInfo endpoint | `https://{keycloak-base}/realms/{realm}/protocol/openid-connect/userinfo` |
| `SESSION_JWT_CLAIM` | `origin_jti` (or as configured) | `jti` or `origin_jti` (see Step 2) |

**Example Keycloak values:**
```env
JWKS_URI=https://keycloak.example.com/realms/txm/protocol/openid-connect/certs
USER_INFO_URI=https://keycloak.example.com/realms/txm/protocol/openid-connect/userinfo
SESSION_JWT_CLAIM=jti
```

### Step 4: Update WellKnownDiscovery (downloadConfig)

If you use `downloadConfig.ts` to fetch OIDC config at startup, update the WellKnown variables:

| Variable | Purpose |
|----------|---------|
| `WK_WELLKNOWN_URI` | Keycloak OpenID discovery URL |
| `WK_CLIENT_ID` | Keycloak client ID |
| `WK_CLIENT_SECRET` | Keycloak client secret |
| `WK_ISSUER` | Optional; Keycloak issuer URL |
| `WK_SCOPE` | `openid` (and any custom scopes) |
| `WK_RESOURCE_NAME` | Resource identifier |
| `WK_OUTPUT_FILE` | Output file path (e.g. `.env` or `.env.oidc`) |

**Example:**
```env
WK_WELLKNOWN_URI=https://keycloak.example.com/realms/txm/.well-known/openid-configuration
WK_CLIENT_ID=txm-user-api
WK_CLIENT_SECRET=<keycloak-client-secret>
WK_SCOPE=openid email profile
WK_RESOURCE_NAME=txm-user-api
WK_OUTPUT_FILE=.env.oidc
```

### Step 5: User Subject Migration (Existing Users)

The API stores `sub` (OIDC subject) in the `subject` array on users. **Cognito and Keycloak use different `sub` values** for the same person.

**Options:**

1. **Email-based linking (recommended)**: `findUserByEmailAndUpdateSubject` already links by email. On first login with Keycloak, the user is found by email and the new Keycloak `sub` is added via `$addToSet`. No manual migration needed — users will accumulate both Cognito and Keycloak subjects over time.
2. **One-time migration**: If you want to pre-populate Keycloak subjects, run a script that:
   - Exports users from Cognito (or your DB)
   - Imports them into Keycloak
   - Updates MongoDB `subject` arrays with the new Keycloak `sub` (requires mapping logic)

For most cases, **Option 1** is sufficient: users log in with Keycloak, and the first-login flow updates their record.

### Step 6: Frontend and Client Updates

- Update frontend OAuth config to use Keycloak:
  - Authorization URL
  - Token URL
  - Logout URL (Keycloak: `{base}/realms/{realm}/protocol/openid-connect/logout`)
- Ensure redirect URIs in Keycloak match the frontend.
- Test login, token refresh, and logout flows.

### Step 7: Deploy and Validate

1. Deploy the API with the new environment variables.
2. Restart the service (or run `downloadConfig` if used before `server.js`).
3. Run validation tests (see below).

### Step 8: Rollback Plan

Keep the previous Cognito values in a backup. If issues occur:

1. Revert `JWKS_URI`, `USER_INFO_URI`, and `SESSION_JWT_CLAIM` to Cognito values.
2. Restore `WK_*` variables if using WellKnownDiscovery.
3. Redeploy and restart.

---

## Validation Checklist

| Test | Expected Result |
|------|-----------------|
| `GET /heartbeat` | 200 OK (no auth) |
| `POST /firstLogin` with Keycloak Bearer token | 200, user created/updated with new `sub` |
| `GET /me` with Keycloak Bearer token | 200, UserRoles or first-login flow |
| `GET /me/self` with Keycloak Bearer token | 200, user + permissions |
| `POST /session/_start` with Keycloak Bearer token | 200, `SESSION_STARTED` |
| `GET /session` (polling) | 200, `SESSION_UPDATED` |
| `POST /session/_logout` | 200, `SESSION_LOGOUT_SUCCESS` |
| `GET /users` (with permissions) | 200, user list |
| Invalid/expired token | 401 Unauthorized |

---

## Claim Mapping Reference

| Claim | Cognito | Keycloak | API Usage |
|-------|---------|----------|-----------|
| `sub` | ✅ | ✅ | User identity, `findMe`, `subject` in DB |
| `email` | ✅ (userinfo) | ✅ (userinfo) | First-login, `findUserByEmailAndUpdateSubject` |
| `jti` | ✅ | ✅ | Session ID (if `SESSION_JWT_CLAIM=jti`) |
| `origin_jti` | Custom | Add mapper if needed | Session ID (default) |

---

## Consequences

- **Positive**: Single IdP (Keycloak), easier to manage users and realms.
- **Positive**: No application code changes; OIDC abstraction holds.
- **Consideration**: Existing users need at least one Keycloak login to get the new `sub` linked (handled by first-login flow).
- **Consideration**: Frontend and any other clients must be updated to use Keycloak auth endpoints.

---

## Related Documentation

- [Decision: Cognito to Keycloak migration](../decisions/2026-02-20-cognito-to-keycloak-migration.md) — ADR for this migration
