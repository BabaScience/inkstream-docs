# Local Development

## Context

This document describes how to set up and run txm-ui locally for development.

---

## Prerequisites

- **Node.js** — LTS version (e.g. 18.x or 20.x)
- **npm** — Comes with Node
- **Backend APIs** — User API, PIF API, Tenant API, etc. (or mocks)
- **OIDC IdP** — Cognito or Keycloak with client configured

---

## Setup

### 1. Install dependencies

```bash
cd txm-ui
npm run setup
```

Uses `--legacy-peer-deps` for compatibility. Run `npm install --legacy-peer-deps` if setup fails.

### 2. Environment configuration

Create or edit `.env.development` (or use `.env.development.local` for overrides):

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_WELLKNOWN_API_URL` | Wellknown config endpoint | `https://api.qa.rad.textgenius.it/.well-known` |
| `REACT_APP_USE_LOCAL_ENV` | Use process.env instead of Wellknown | `true` (for local dev) |
| `REACT_APP_CLIENTID` | OIDC client ID | From IdP |
| `REACT_APP_AUTHORITY_URI` | OIDC authority | Cognito/Keycloak URL |
| `REACT_APP_LOGOUT_URI` | IdP logout URL | |
| `REACT_APP_USER_API_URL` | User API base URL | `http://localhost:3001` |
| `REACT_APP_TENANT_API_URL` | Tenant API | |
| `REACT_APP_PIF_API_URL` | PIF API | |
| `REACT_APP_ME_API_URI` | Me endpoint | `http://localhost:3001/me` |

See [env-variables-reference](../notes/env-variables-reference.md) for full list.

---

## Run

### HTTP (default)

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000). Uses port 3000 by default.

### HTTPS (with certificates)

For HTTPS (e.g. required by OIDC in some setups):

**Windows:**
```bash
npm run dev:windows
```

**Linux/macOS:**
```bash
npm run dev
```

Requires SSL cert files: `techvisory.textvisory.it.crt`, `techvisory.textvisory.it.key`. Host: `techvisory.textvisory.it`, port 443.

---

## Build

```bash
# Development build
npm run build

# Production build
npm run build:prod

# Low-memory build (4GB)
npm run build:lowmem
```

Output in `build/`. Use `npm run clean` before build to remove previous output.

---

## Testing

### Unit tests

```bash
npm test
```

Uses Jest + React Testing Library. Watch mode by default.

### E2E tests

```bash
npm run e2e-test
```

Uses Playwright. For UI mode:

```bash
npm run e2e-test:ui
```

---

## Verification

1. App loads; Wellknown or local env provides config.
2. Navigate to `/login` or protected route; OIDC redirect works.
3. After login, redirect to `/select-tenant` or `/home`.
4. Select tenant; session starts; polling runs.
5. Navigate to Projects, Items; API calls succeed (check Network tab).

---

## Troubleshooting

- **CORS errors**: Ensure backend allows origin (e.g. `http://localhost:3000`).
- **OIDC redirect mismatch**: `redirect_uri` must match IdP client config (`window.location.origin + "/authentication/callback"`).
- **Wellknown fails**: Set `REACT_APP_USE_LOCAL_ENV=true` and define vars in `.env.development`.
- **Session 409**: User has max sessions; use override or logout from other tab.
