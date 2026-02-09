# Plan: Redis Data Viewer

## Context

The Angular app currently has an order form that POSTs to a Go backend on port 3000. A separate Go backend (`go-read-redis`) runs on port 3001 and exposes Redis data via two GET endpoints. We need to fetch this data and display it in a table in the Angular UI.

**Important:** The Go backend returns **plain text**, not JSON:
- `GET /order/keys` → `Keys: [key1 key2 key3]` (space-separated, no commas)
- `GET /order/{key}` → raw string value (e.g. `"sóbblers"`)

---

## Files to Create (10 new)

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Dev environment config with `redisApiUrl` |
| `src/environments/environment.prod.ts` | Prod environment config |
| `src/app/models/redis-entry.model.ts` | `RedisEntry` interface (`key`, `value`) |
| `src/app/services/redis.service.ts` | HTTP service: fetch keys, fetch values, retry logic |
| `src/app/services/redis.service.spec.ts` | Jest tests for the service |
| `src/app/components/data-table/data-table.component.ts` | Reusable table component (signal inputs) |
| `src/app/components/data-table/data-table.component.html` | Table template |
| `src/app/components/data-table/data-table.component.scss` | Table styles |
| `src/app/components/data-table/data-table.component.spec.ts` | Jest tests for the table |
| `src/app/components/redis-viewer/redis-viewer.component.ts` | Main viewer: orchestrates loading, error, display |
| `src/app/components/redis-viewer/redis-viewer.component.html` | Viewer template (card layout matching order-form) |
| `src/app/components/redis-viewer/redis-viewer.component.scss` | Viewer styles |
| `src/app/components/redis-viewer/redis-viewer.component.spec.ts` | Jest tests for the viewer |

## Files to Modify (4)

| File | Change |
|------|--------|
| `proxy.conf.json` | Add `/redis-api` → `localhost:3001` proxy entry |
| `src/app/models/index.ts` | Add `RedisEntry` barrel export |
| `src/app/app.ts` | Import `RedisViewerComponent` |
| `src/app/app.html` | Add `<app-redis-viewer />` in a second column |

---

## Implementation Details

### 1. Proxy Configuration (`proxy.conf.json`)

Add a second proxy entry mirroring the existing `/api` pattern:
```json
"/redis-api": {
  "target": "http://localhost:3001",
  "secure": false,
  "pathRewrite": { "^/redis-api": "" },
  "changeOrigin": true
}
```

### 2. Environment Files

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  redisApiUrl: '/redis-api'
};
```
Same for `environment.prod.ts`. In dev, the proxy handles routing. In prod, the value can be changed to the actual backend URL.

### 3. Model (`redis-entry.model.ts`)

```typescript
export interface RedisEntry {
  key: string;
  value: string;
}
```

### 4. RedisService (`redis.service.ts`)

Follows `OrderService` patterns (`inject(HttpClient)`, `providedIn: 'root'`, private `handleError`).

Key methods:
- **`getEntries(): Observable<RedisEntry[]>`** — public API, orchestrates the full flow
- **`getKeys()`** — calls `/order/keys` with `responseType: 'text'`, parses plain text response
- **`getValueByKey(key)`** — calls `/order/{key}` with `responseType: 'text'`
- **`parseKeysResponse(text)`** — extracts keys from `Keys: [a b c]` format via regex + split

**Retry mechanism:** RxJS `retry({ count: 3, delay: 1000 })` on each HTTP call. After exhausting retries, throws `"Could not retrieve any data"`.

**Key orchestration:** Uses `forkJoin` to fetch all values in parallel after getting keys. Individual value failures are caught gracefully (show error text in the value column rather than failing the whole table).

### 5. DataTableComponent (reusable)

Signal inputs:
- `columns = input.required<string[]>()` — column header names
- `rows = input.required<Record<string, string>[]>()` — row data keyed by column name

Template uses `@for` / `@empty` with Bootstrap `table-striped table-hover` and `table-dark` header. Shows "No data available" when empty.

### 6. RedisViewerComponent

Signal state: `isLoading`, `entries`, `errorMessage` (same pattern as `OrderFormComponent`).

Computed: `tableRows` transforms `RedisEntry[]` → `Record<string, string>[]` for the DataTableComponent.

Template: Bootstrap card with dark header (matching order-form), three states via `@if`/`@else`:
1. Loading → Bootstrap spinner inline
2. Error → alert with retry button
3. Data → `<app-data-table>` with columns `['KEY', 'VALUE']`

Includes a Refresh button in the card header.

### 7. App Integration (`app.html`)

Add redis-viewer in a second Bootstrap column beside the order form:
```html
<div class="col-md-6 col-lg-5">
  <!-- existing order form -->
</div>
<div class="col-md-6 col-lg-7">
  <app-redis-viewer />
</div>
```

---

## Verification

1. Run `npm test` from `angular-gui/` — all existing + new tests must pass
2. Run `npm run test:coverage` — verify 80% threshold is met
3. Backend environment is already working
4. Verify the table loads with Redis data
5. Stop the Go backend and verify retry + error message behavior
