# txm-ui Documentation Index

## Overview

This index lists all documentation for txm-ui. Docs are organized by category per InkStreamCLI conventions.

---

## Architecture

| Document | Description |
|----------|-------------|
| [high-level.md](../architecture/high-level.md) | Component hierarchy, modules, external integrations |
| [data-flow.md](../architecture/data-flow.md) | Request lifecycle, auth flow, session flow, API flow, session storage |

---

## Workflows

| Document | Description |
|----------|-------------|
| [auth-and-session-flow.md](../workflows/auth-and-session-flow.md) | Login, first-login, session lifecycle, error handling |
| [local-development.md](../workflows/local-development.md) | Setup, run, build, test |
| [cognito-to-keycloak-migration.md](../workflows/cognito-to-keycloak-migration.md) | Frontend migration from Cognito to Keycloak |

---

## API

| Document | Description |
|----------|-------------|
| [api-overview.md](../api/api-overview.md) | useApi, fetchWithToken, services, response format |
| [api-services-reference.md](../api/api-services-reference.md) | User, Session, PIF, Tenant API methods |

---

## Features

| Document | Description |
|----------|-------------|
| [routing-and-pages.md](../features/routing-and-pages.md) | Routes enum, page hierarchy, public vs authorized |
| [permissions-model.md](../features/permissions-model.md) | Permissions, usePermissions, UI gating flags |

---

## Notes

| Document | Description |
|----------|-------------|
| [env-variables-reference.md](env-variables-reference.md) | All REACT_APP_* and related env vars |
| [documentation-index.md](documentation-index.md) | This index |

---

## Quick Links for Developers

- **Getting started**: [local-development.md](../workflows/local-development.md)
- **Auth flow**: [auth-and-session-flow.md](../workflows/auth-and-session-flow.md)
- **API usage**: [api-overview.md](../api/api-overview.md)
- **Routes**: [routing-and-pages.md](../features/routing-and-pages.md)
- **Permissions**: [permissions-model.md](../features/permissions-model.md)
