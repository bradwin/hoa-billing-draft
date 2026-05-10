# Unit Test Execution

## Run Unit Tests

### All Workspace Tests

```bash
npm run test
```

### Shared Domain Tests

```bash
npm test -w @hoa/shared
```

### API Tests

```bash
npm test -w @hoa/api
```

### Web Tests

```bash
npm test -w @hoa/web
```

### Worker Tests

```bash
npm test -w @hoa/worker
```

## Property-Based Tests

```bash
npm run test:pbt
```

For deterministic replay after a PBT failure:

```bash
PBT_SEED=<seed-from-failure> npm run test:pbt:replay
```

## Expected Results

| Suite | Expected Result |
|---|---|
| API | All Nest service, controller, integration, and PBT tests pass. |
| Web | All React/Next.js component and shell tests pass. |
| Worker | Support intent and cleanup job tests pass. |
| Shared | Domain, schema, permission, and PBT tests pass. |

## Failure Handling

1. Read the first failing assertion or compile error.
2. Fix the smallest code path that owns the failure.
3. Rerun the targeted workspace test.
4. Rerun `npm run test` and `npm run test:pbt` before considering the fix complete.
