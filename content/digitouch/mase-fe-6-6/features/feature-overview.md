---
title: "Feature Overview"
description: "Summary of features and capabilities in mase-fe-6-6"
date: 2026-02-27
tags: [features, maps, documents, calculation]
---

# Feature Overview

This document summarizes the main features of the mase-fe-6-6 microfrontend.

## Feature Categories

### 1. Map Visualization (Mappe)

| Feature | Route | Description |
|---------|-------|-------------|
| Region Selection | `scelta-della-regione` | Select Italian regions for map context |
| Map Search | `ricerca-delle-mappe` | Search and browse available maps |
| Produced AIB Maps | `ricerca-delle-mappe-AIB-prodotte` | Search AIB-produced maps, validation, sharing |
| Vegetation Status | `carta-dello-stato-di-vegetazione` | Vegetation status map (NDVI) |
| Water Stress | `carta-dello-stress-idrico` | Water stress map (NDMI) |
| Environmental Indicators | `indicatori-ambientali-periodo` | Environmental indicators by period |

### 2. Documents (Documenti)

| Feature | Route | Description |
|---------|-------|-------------|
| Manuals | `manuali` | User manuals and documentation |
| AIB Plans | `piani-aib` | AIB plans (Piani AIB) — browse, upload, download |

### 3. Calculation Tools (Strumenti di Calcolo)

| Feature | Route | Description |
|---------|-------|-------------|
| Input Card Activation | `attivazione-carte-input` | Run fire algorithms (probability, history, danger) with input cards |
| Input Card Upload | `caricamento-carta-input` | Upload and manage input card layers |

### 4. Help

| Feature | Route | Description |
|---------|-------|-------------|
| Help Online | `help-online` | In-app help, documents, downloads |

## Algorithms (MVP-2)

The following fire algorithms are enabled in mvp-2:

| ID | Name | Endpoint |
|----|------|----------|
| 7 | Fire Probability | `fire-probability/calculate` |
| 8 | Fire History | `fire-history/calculate` |
| 13 | Fire Danger | `fire-danger/calculate` |

## Role-Based Access

Some features are restricted by user role:

- **Input Card Activation** — Requires `canAccessInputCardActivation(user)` (non-MASE users with algorithm access)
- **Input Card Upload** — May require specific permissions
- **Home cards** — Shown/hidden based on `isUserMase(user)` and feature flags

## Feature Flags (MVP Config)

Features are toggled via `MVP_CONFIGS` in `src/config/config.js`:

| Flag | mvp-1 | mvp-2 | mvp-3 |
|------|-------|-------|-------|
| HOMEPAGE | ✓ | ✓ | ✓ |
| MAP_VISUALIZATION | ✓ | ✓ | ✓ |
| REGION_SELECTION | ✓ | ✓ | ✓ |
| MAP_SEARCH | ✓ | ✓ | ✓ |
| MAP_SEARCH_PRODUCED | — | ✓ | ✓ |
| CARTA_VEGETAZIONE | — | — | — |
| CARTA_STRESS_IDRICO | — | — | — |
| DOCUMENTS | — | ✓ | ✓ |
| MANUALI | — | ✓ | ✓ |
| PIANI_AIB | — | ✓ | ✓ |
| STRUMENTI_CALCOLO | — | ✓ | ✓ |
| INPUT_CARD_ACTIVATION | — | ✓ | ✓ |
| INPUT_CARD_UPLOAD | — | ✓ | ✓ |
| PERICOLOSITA_INCENDIO | — | — | ✓ |

## Key Components

- **CustomGeoinsight** — Wraps GeoInsight map components
- **CustomTable**, **CustomAccordion**, **CustomDialog** — Reusable UI
- **JobAccordion**, **ValidationJobsAccordion**, **SharingJobsAccordion** — Job status display
- **FeatureFlagProtectedRoute** — HOC that hides routes when feature is disabled
