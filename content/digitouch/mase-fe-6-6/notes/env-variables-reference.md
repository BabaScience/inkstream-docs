---
title: "Environment & Config Reference"
description: "Configuration options, constants, and environment variables for mase-fe-6-6"
date: 2026-02-27
tags: [notes, config, environment]
---

# Environment & Config Reference

Reference for configuration options and constants used in mase-fe-6-6.

## Config File

Primary config: `src/config/config.js`

### Mock Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `USE_MOCKS` | boolean | `false` | Enable general API mocks |
| `USE_MOCKS_REGION` | boolean | `true` | Mock region data |
| `USE_MOCKS_SEARCH_PARK` | boolean | `true` | Mock national park search |
| `USE_MOCKS_INPUT_CARD` | boolean | `false` | Mock input card APIs |

### File Upload Limits

| Variable | Value | Description |
|----------|-------|-------------|
| `MAX_FILE_SIZE_MB` | 50 | Max file size in MB |
| `ALLOWED_DOCUMENT_EXTENSIONS` | `.pdf`, `.doc`, `.docx` | Allowed document types |
| `ALLOWED_ZIP_EXTENSIONS` | `.zip` | Allowed archive type |

### Algorithm Config

| Variable | Value | Description |
|----------|-------|-------------|
| `ALGORITHM_TIMEOUT_POLLING` | 500 | Polling interval (ms) for algorithm status |
| `CU_ID` | `"V6_6"` | Context unit identifier |

### MVP Version

| Variable | Values | Description |
|----------|--------|-------------|
| `MVP_VERSION` | `"mvp-1"` \| `"mvp-2"` \| `"mvp-3"` | Active MVP; controls feature visibility |

### Layer GUIDs

| Variable | Description |
|----------|-------------|
| `LAYER_GUIDS.CARTA_VEGETAZIONE` | GUID for vegetation layer (placeholder) |
| `LAYER_GUIDS.CARTA_STRESS_IDRICO` | GUID for water stress layer (placeholder) |

## API Configuration

File: `src/services/apiConfig.js`

### Base URLs

| Variable | Value |
|----------|-------|
| `BASE_URL` | `/core/api/v6/6.6/v_1/` |
| `ALFRESCO_BASE_URL` | `/core/api/alfresco/masedm/node/` |
| `HELPONLINE_BASE_URL` | `/core/api/alfresco/helponline/node/` |

### Main Endpoint Groups

- **National parks** — `national-parks`
- **Input cards** — `input-cards`, `input-cards-full`, `layers/import`
- **AIB plans** — `aib-plans`, `aib-plans/upload`, `aib-plans-history`
- **Algorithms** — `fire-probability/calculate`, `fire-history/calculate`, `fire-danger/calculate`
- **Validation** — `layers/validate-layer`, `layers/validate-layer/status`
- **Statistics** — `statistics/territory`
- **Alfresco** — Document management for AIB plans

## Routes

File: `src/routers/Routes.jsx`

| Variable | Value |
|----------|-------|
| `HomePath` | `/portalediaccesso/incendi-boschivi/6.6/` |
| `RoutesPath` | Object with route slugs (e.g. `sceltaRegione`, `ricercaMappe`) |

## Webpack

File: `webpack.config.js`

| Setting | Value |
|---------|-------|
| `orgName` | `mase` |
| `projectName` | `fe-6-6` |
| `devServer.port` | 9102 |
| `devServer.hot` | `false` |

## Labels / i18n

Labels are loaded from `@mase/fe-6-6/label` (resolved via webpack alias to `public/label.js` or `public/label.json`). Structure includes:

- `label.components.sidebar` — Sidebar menu labels
- `label.pages.homePage` — Home page content
- Language keys (e.g. `it`, `en`) for each section
