---
title: Architecture Overview
---

# Architecture Overview

An overview of the Sample Project architecture for demonstrating InkStream's multi-workspace capability.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Backend | Node.js 20, Fastify |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Deployment | Docker + Kubernetes |

## Service Topology

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │   Nginx     │
                    │  (reverse   │
                    │   proxy)    │
                    └──────┬──────┘
               ┌───────────┼───────────┐
        ┌──────▼─────┐     │     ┌─────▼──────┐
        │  Frontend  │     │     │   API GW   │
        │  (Next.js) │     │     │  (Fastify) │
        └────────────┘     │     └─────┬──────┘
                           │           │
                    ┌──────▼──────┐    │
                    │  Auth Svc   │    │
                    │  (Keycloak) │    │
                    └─────────────┘    │
                                 ┌─────▼──────┐
                                 │ PostgreSQL  │
                                 └─────────────┘
```

## Design Principles

1. **Stateless services** — All application state lives in PostgreSQL or Redis
2. **JWT authentication** — Keycloak issues tokens; services validate locally
3. **Event-driven updates** — Mutations emit domain events via Redis Streams
4. **Read replicas** — High-traffic read paths routed to PostgreSQL read replicas
