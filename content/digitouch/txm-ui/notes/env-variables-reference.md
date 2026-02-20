# Environment Variables Reference

## Context

txm-ui configuration comes from either the Wellknown API (production) or local `.env` files (when `REACT_APP_USE_LOCAL_ENV=true`). All React env vars must be prefixed with `REACT_APP_` to be exposed to the client.

---

## Wellknown / Config

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_WELLKNOWN_API_URL` | URL to fetch Wellknown config | `https://api.qa.rad.textgenius.it/.well-known` |
| `REACT_APP_USE_LOCAL_ENV` | Use process.env instead of Wellknown | `true` |

---

## Auth

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_CLIENTID` | OIDC client ID | From Cognito/Keycloak |
| `REACT_APP_AUTHORITY_URI` | OIDC authority (IdP URL) | Cognito user pool or Keycloak realm URL |
| `REACT_APP_LOGOUT_URI` | IdP logout URL | Redirect target for logout |

---

## API URLs

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_USER_API_URL` | User API base | `http://localhost:3001` |
| `REACT_APP_ME_API_URI` | Me endpoint (full URL) | `http://localhost:3001/me` |
| `REACT_APP_TENANT_API_URL` | Tenant API | |
| `REACT_APP_PIF_API_URL` | PIF API (projects, items, findings) | |
| `REACT_APP_ANALYZER_API_URL` | Analyzer API | |
| `REACT_APP_DASHBOARD_API_URL` | Dashboard/analytics API | |
| `REACT_APP_RULE_API_URL` | Rules API | |
| `REACT_APP_RULEXEC_API_URL` | Rule execution API | |
| `REACT_APP_LOV_API_URL` | LOV API | |
| `REACT_APP_TEMPLATE_API_URL` | Template API | |
| `REACT_APP_OMNIA_API_URL` | Omnia search API | |
| `REACT_APP_AIGEN_API_URL` | AI generation API | |
| `REACT_APP_CHAT_API_URL` | Chat API | |
| `REACT_APP_FORM_API_URL` | Form API | |
| `REACT_APP_FEEDBACK_API_URL` | Feedback API | |
| `REACT_APP_AGENT_SERVICE_API_URL` | Agent service API | |

---

## AWS RUM

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_AWS_RUM_ID` | RUM application ID | |
| `REACT_APP_AWS_RUM_REGION` | AWS region | `eu-west-1` |
| `REACT_APP_AWS_RUM_VERSION` | RUM version | `1.0.0` |
| `REACT_APP_AWS_RUM_ROLE_ARN` | Guest role ARN | |
| `REACT_APP_AWS_RUM_IDENTITY_POOL_ID` | Identity pool ID | |
| `REACT_APP_AWS_RUM_ENDPOINT` | RUM endpoint | |

---

## Application Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_ITEM_REFRESH_INTERVAL` | Item list refresh interval (ms) | `10000` |
| `REACT_APP_SESSION_REFRESH_INTERVAL` | Session polling interval (ms) | `30000` |
| `REACT_APP_TENANT_LOGO` | Default tenant logo filename | `textvisory-logo.png` |
| `REACT_APP_MAIN_LOGO` | Main logo (from Wellknown) | |

---

## Build / CRA

| Variable | Purpose |
|----------|---------|
| `GENERATE_SOURCEMAP` | Generate source maps |
| `NODE_ENV` | `development` or `production` |
| `PUBLIC_URL` | Base URL for assets |
| `HTTPS` | Use HTTPS in dev |
| `PORT` | Dev server port |
| `HOST` | Dev server host |
