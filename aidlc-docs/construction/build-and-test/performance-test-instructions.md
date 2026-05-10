# Performance Test Instructions

## Scope

Performance tests are applicable because the system includes authenticated staff search, homeowner self-service, PostgreSQL-backed master data, and future financial workflows. Concrete SLO verification has not been executed yet. Production use remains blocked until workload targets are approved and measured in a staging-like environment.

## Initial Performance Targets To Validate

| Area | Initial Target |
|---|---|
| Staff homeowner/property search | p95 under 500 ms for approved first-scope data volume with indexed filters |
| UOW-02 billable validation | p95 under 300 ms for single-property validation by `validationDate` |
| Authenticated API command paths | p95 under 750 ms excluding external services |
| Concurrent authenticated sessions | 50 concurrent sessions per approved first-scope infrastructure |
| Error rate | Under 1% for valid requests during steady-state load |

These are starter validation targets, not approved production SLOs. If the business needs stricter guarantees, requirements must be reopened.

## Setup Performance Test Environment

### 1. Start Staging-Like Stack

```bash
docker compose -f docker/docker-compose.staging.yml up --build
```

Use synthetic or sanitized data only.

### 2. Apply Migrations And Seed Data

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

Seed enough synthetic homeowners, properties, aliases, ownership periods, billing-account periods, and contact requests to represent the approved first scope.

### 3. Configure Test Parameters

| Parameter | Initial Value |
|---|---|
| Test duration | 15 minutes steady state |
| Ramp-up | 2 minutes |
| Concurrent users | 50 |
| Data size | Up to 1,000 homeowner users and first-scope property volume |

## Required Performance Scenarios

| Scenario | Expected Measurement |
|---|---|
| Staff homeowner search by name/code/status | API latency, database query time, result count, error rate |
| Staff property search by code/block/lot/alias | API latency, database query time, result count, error rate |
| Property billable validation by `validationDate` | API latency, query count, reason-code correctness |
| Ownership transfer command | command latency, lock wait, conflict rate |
| Contact request submission and staff decision | command latency, audit append latency, error rate |
| Auth/session protected shell load | web route build/runtime latency and API auth latency |

## Run Performance Tests

No performance runner is committed yet. Recommended first implementation is `k6` or an equivalent HTTP load tool.

Example future command:

```bash
k6 run ops/performance/uow02-master-data.js
```

## Analyze Results

Capture:

- p50, p95, and p99 latency.
- Throughput.
- Error rate.
- PostgreSQL slow queries.
- Lock waits and connection pressure.
- CPU, memory, and disk pressure.
- Search query plans for UOW-02 indexed paths.

## Failure Handling

If performance targets are not met:

1. Confirm indexes exist and migrations were applied.
2. Inspect PostgreSQL query plans.
3. Check bounded pagination and minimum filter behavior.
4. Optimize query shape or indexes.
5. Rerun the same scenario.
6. Reopen requirements before adding Redis, external search, queueing, Kubernetes, autoscaling, or managed cloud infrastructure.

## Current Status

| Area | Status |
|---|---|
| Performance instructions | Generated |
| Concrete runner | Not implemented |
| SLO approval | Not complete |
| Production readiness | Blocked until staging performance evidence exists |
