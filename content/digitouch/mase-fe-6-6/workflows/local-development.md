---
title: "Local Development"
description: "Developer workflows for running and testing mase-fe-6-6 locally"
date: 2026-02-27
tags: [workflows, development, single-spa]
---

# Local Development

This document describes how to run and develop mase-fe-6-6 locally.

## Prerequisites

- **Node.js** — LTS version (18.x or 20.x recommended)
- **npm** — Comes with Node.js
- **Git** — For version control

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd mase-fe-6-6
npm install
```

### 2. Start Development Server

**Standard mode** (requires root config / shell app):

```bash
npm start
```

Runs webpack-dev-server on **port 9102**. The app expects to be loaded by a Single-SPA root config that registers this microfrontend.

**Standalone mode** (no root config):

```bash
npm run start:standalone
```

Useful for developing this microfrontend in isolation. The app will mount at its configured path.

## Mock Mode

For development without backend services, enable mocks in `src/config/config.js`:

| Flag | Purpose |
|------|---------|
| `USE_MOCKS` | General API mocks |
| `USE_MOCKS_REGION` | Region selection mock data |
| `USE_MOCKS_SEARCH_PARK` | National park search mocks |
| `USE_MOCKS_INPUT_CARD` | Input card mocks |

Mock data lives in `src/mocks/` (e.g. `regionsMock.js`, `mapSearchMock.js`, `inputCardMock.js`).

## Code Quality

```bash
# Lint
npm run lint

# Format (Prettier)
npm run format

# Check format without writing
npm run check-format
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run watch-tests

# Coverage report
npm run coverage
```

## Build

```bash
# Production build
npm run build

# Build with bundle analysis
npm run analyze
```

## MVP Configuration

To enable/disable features during development, edit `src/config/config.js`:

```javascript
export const MVP_VERSION = "mvp-2";  // mvp-1 | mvp-2 | mvp-3
```

- **mvp-1** — Minimal feature set
- **mvp-2** — Full document and calculation tools (default)
- **mvp-3** — Includes fire danger features

## Integration with Root Config

When developing within the full digitouch portal:

1. Ensure the root config registers this app at `/portalediaccesso/incendi-boschivi/6.6/`
2. The app name in Single-SPA is `@mase/fe-6-6`
3. Webpack externals include `single-spa`, `react`, `react-dom`, and `@mase/*` / `@sim/*` packages

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 9102 in use | Change `devServer.port` in `webpack.config.js` |
| CORS / API errors | Use mock mode or ensure backend proxy is configured |
| Blank page | Check browser console; verify root config is loading the app |
| Feature not visible | Check `MVP_VERSION` and feature flags in `config.js` |
