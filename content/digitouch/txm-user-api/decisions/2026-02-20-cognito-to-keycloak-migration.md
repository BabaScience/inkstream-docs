# Migrate from AWS Cognito to Keycloak

## Context

txm-user-api has been using **AWS Cognito** as the identity provider (IdP) for OAuth 2.0 / OpenID Connect authentication. Keycloak has been deployed in the environment and its endpoints are available. The team needs to migrate authentication from Cognito to Keycloak to consolidate identity management, reduce vendor lock-in, and align with organizational IdP standards.

The API uses `@techvisory/oidc-introspect` for token validation and userinfo retrieval. This library is OIDC-standard compliant and does not depend on Cognito-specific behavior, so the migration is primarily a configuration change rather than a code change.

## Decision

We will migrate from AWS Cognito to Keycloak by:

1. **Updating environment configuration** — Point `JWKS_URI` and `USER_INFO_URI` to Keycloak realm endpoints. No application code changes are required.
2. **Configuring session claim** — Use Keycloak’s `jti` claim (or add `origin_jti` via protocol mapper) for session management. Set `SESSION_JWT_CLAIM` accordingly.
3. **Updating WellKnownDiscovery** — If used, point `WK_WELLKNOWN_URI` to Keycloak’s OpenID discovery URL.
4. **Relying on first-login flow for subject migration** — Existing users will have their Keycloak `sub` added to the `subject` array on first login via `findUserByEmailAndUpdateSubject`, using email as the linking key.
5. **Coordinating with frontend** — Update OAuth client configuration to use Keycloak authorization, token, and logout URLs.

The detailed migration procedure is documented in [Cognito to Keycloak Migration](../workflows/cognito-to-keycloak-migration.md).

## Consequences

- **No code changes** — The OIDC abstraction holds; only configuration changes are needed.
- **User continuity** — Users are linked by email on first Keycloak login; no manual DB migration for subjects is required in the typical case.
- **Single IdP** — Keycloak becomes the central identity provider, simplifying administration.
- **Frontend impact** — Login, logout, and token refresh URLs must be updated in all clients.
- **Rollback** — Reverting env vars to Cognito values allows quick rollback if issues arise.

## Alternatives Considered

- **Dual IdP support** — Supporting both Cognito and Keycloak simultaneously would require code changes (e.g., multiple JWKS sources) and increase complexity. Rejected for this migration; can be revisited if a gradual cutover is required.
- **User migration script** — Pre-migrating all user subjects from Cognito to Keycloak would require a mapping between Cognito `sub` and Keycloak `sub`, which is not trivially available. The first-login flow is simpler and sufficient for most cases.
- **Keeping Cognito** — Rejected because Keycloak is already deployed and the organizational direction is to standardize on Keycloak.
