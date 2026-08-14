# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Casagrande Frontend — a Create React App (react-scripts 5) + TypeScript admin/ERP-style app (clientes, produtos, orçamentos, vendas, calendário). MUI v5 for UI, Redux Toolkit for state, react-router-dom v6 (data router) for routing, axios for HTTP.

## Commands

- `npm start` — run the dev server (react-scripts).
- `npm run build` — production build using default `.env` files.
- `npm run build:production` — build with `.env.production` explicitly loaded via `env-cmd` (installs `env-cmd` globally first).
- `npm test` — runs CRA's built-in Jest (`react-scripts test`), watch mode by default. Pass a filename/pattern to scope: `npm test -- login.test.tsx`. Pass `-- --watchAll=false` for a single non-watch run (e.g. in CI).
- No dedicated lint script; ESLint runs via CRA's build-time config in `package.json` (`eslintConfig: { extends: ["react-app", "react-app/jest"] }`).

Note: `src/jest.config.js` (ts-jest based) is an in-progress alternate Jest setup not yet wired into `package.json` scripts — `npm test` still uses CRA's Jest under the hood. If asked to run a single test, prefer `npm test -- <pattern>`.

Env vars live in `.env`, `.env.development`, `.env.production` (CRA convention, `REACT_APP_*` prefix) and are re-exported as named constants in `src/infrastructure/env.js` (`API_URL`, `DROPBOX_TOKEN`, `TRELLO_API_KEY`, `SLACK_TOKEN`, etc.) — import from there rather than reading `process.env` directly.

## Architecture

### Feature-folder structure
Each screen lives under `src/features/<name>/` and typically contains:
- `<name>.page.tsx` — top-level page component, wired into `src/routes/routes.tsx`.
- `<name>.service.ts` — a class (e.g. `ClientesService`) wrapping `HttpClient` calls, mapping raw API responses (`*Response` types) to app-facing DTOs (`*DTO` types).
- `<name>.contracts.ts` — TS interfaces for DTOs/responses/requests.
- `<name>-common.ts` — pure helper/mapper functions shared within the feature.
- `api.ts` (some features, e.g. `clientes`) — an RTK Query `createApi` slice as an alternative/parallel data-access path to the service class; registered in `src/redux-ts/store.tsx` and its middleware concatenated into the store.
- Sub-features nest their own folder (e.g. `clientes/clientes-external/`).

Two coexisting data-fetching patterns are in use: hand-rolled `*.service.ts` classes calling `HttpClient`, and RTK Query `api.ts` slices. Check which one a feature already uses before adding new endpoints — don't mix both for the same resource without reason.

### HTTP layer
`src/infrastructure/httpclient.component.tsx` defines `HttpClient`, a class that reads the auth token via `useAppSelector(selectToken)` **at construction time** (it calls Redux hooks in its constructor, so `new HttpClient()` must happen during a component/hook render, not in a plain module-level function). It registers a global axios response interceptor that dispatches `unauthenticate()`, clears `localStorage.token`, and reloads the page on a 401 from `API_URL`. All service classes construct `new HttpClient()` in their own constructor.

### Auth & routing
- `src/providers/auth.provider.tsx` exposes `AuthContext`/`AuthProvider` with `onLogin`/`onLogout`/`isAuthenticated`/`isAuthorized`; it persists the token (and `fullname`) to `localStorage` and dispatches to the `auth` Redux slice. Consume it via `useAuth()` from `src/extensions`.
- The JWT itself carries `is_admin` and a comma-separated `allowed_routes` string (`src/redux-ts/slices/auth.slice.tsx` → `getAllowedRoutes`, `parseJwt` in `src/infrastructure/helpers.ts`). Route access checks (`IsAuthorized` in `helpers.ts`, used by `AuthProvider.isAuthorized`) compare the current path against that list.
- `src/routes/routes.tsx` defines `pageRoutes` (enum of paths) and the `createBrowserRouter` route table; every protected page is wrapped in `<ProtectedRoute>` (`src/routes/protected-route.tsx`), which redirects to `LOGIN` (unauthenticated) or `UNAUTHORIZED` (authenticated but not permitted).

### Redux store
`src/redux-ts/store.tsx` combines: `auth` (token), `sidebar`, plus one reducer per RTK Query API slice (e.g. `clientesApi`) — each new `api.ts` needs both its reducer and `.middleware` added here. `LogMiddleware` (`src/redux-ts/middlewares/log.middleware.tsx`) logs dispatched actions. Use `useAppDispatch`/`useAppSelector` from `src/redux-ts/hooks.tsx`, not the raw react-redux hooks.

### Shared UI
`src/components/` holds cross-feature building blocks — notably `z-grid` (a data-grid wrapper), `dialogs`, `report` (PDF report pieces via `@react-pdf/renderer`), `masks` (input masking), `select`/`combobox`, `top-bar`/`sidebar` (app chrome). Reuse these rather than building feature-local equivalents.

### Testing
Tests colocate with source (`*.test.tsx`, `*.spec.tsx`). CRA's Jest runs through `jest.mock(...)` for services/context providers (see `src/features/login/login.test.tsx` for the pattern: mock `react-router-dom` hooks, mock the feature's `*.service`, wrap the component under test in `AuthContext.Provider`/`LoadingContext.Provider` + `BrowserRouter`). `src/__mocks__/` holds manual mocks (`fileMock.js` for assets, `_axios.js`).
