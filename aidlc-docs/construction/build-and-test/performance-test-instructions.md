# Performance Test Instructions

## Purpose

Validate that financial workflows remain stable under expected administrative and homeowner usage.

## Performance Targets

| Area | MVP Target |
|---|---|
| Authentication and protected shell reads | p95 under 500 ms in local/staging-like conditions. |
| Paginated master-data reads | p95 under 750 ms for normal page sizes. |
| Financial mutation APIs | Complete within one database transaction and avoid unbounded in-memory processing. |
| UOW-06 candidate generation | Batch-oriented and page-limited; large association runs require background-capable execution before production scale. |

## Manual Load-Test Setup

1. Start the local stack with PostgreSQL and application services.
2. Seed representative homeowners, properties, billing accounts, invoices, payments, and delinquency facts.
3. Use a load tool such as `k6`, `autocannon`, or JMeter against authenticated API routes.

## Candidate Scenarios

| Scenario | Endpoint Area | Expected Result |
|---|---|---|
| Staff aging review | `GET /delinquency/aging` | Paginated response with stable latency. |
| Penalty candidate generation | `POST /delinquency/penalties/candidates` | No financial mutation during candidate generation. |
| Selected penalty application | `POST /delinquency/penalties/apply` | Transactional source record and balance-impact creation. |
| Waiver approval | `POST /delinquency/waivers/:id/decision` | Idempotent approval behavior. |
| Reminder intent creation | `POST /delinquency/reminders/intents` | Intent creation only, no SMTP/rendering side effects. |

## Production Blockers

Concrete performance SLO validation is still required before production use with real financial records. The MVP code is structurally testable, but load-test scripts and staging-scale datasets remain future work.
