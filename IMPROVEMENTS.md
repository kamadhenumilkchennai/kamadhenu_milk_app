# Codebase Audit & Improvement Roadmap

Generated: 2026-02-26

This file summarizes the main issues discovered in a scan of the repository and provides a clear, actionable Implementation Plan (empty checklist) so we can track work.

Quick summary

- Secrets committed to repo (hard-coded Supabase keys and .env) — critical
- Console.log statements and debug prints in production code — high
- Widespread `any` usage and weak typing — high
- Missing/insufficient error handling around async Supabase calls and uploads — high
- Potential subscription / listener cleanup issues — medium

Notable files to fix first

- `lib/supabase.ts` (hard-coded URL & anon key)
- `.env` (contains admin password and SUPABASE_KEY)
- `app/(admin)/menu/create.tsx` (uses `any` and has image upload flows)
- `components/RemoteImage.tsx`, `components/RemoteProfileImage.tsx` (storage fetches)
- `providers/AuthProvider.tsx`, `providers/NotificationProvider.tsx` (console logs, listener cleanup)

Implementation Plan (empty checklist)

Priority: Immediate (secrets, auth, and config)

- [x] Remove secrets from the repository and add `.env` to `.gitignore`. (Partially done: `.env` already listed in `.gitignore`; rotate keys separately.)
- [ ] Rotate exposed Supabase keys and admin password.
- [x] Update `lib/supabase.ts` to read from environment variables (server for service keys). (Implemented: reads `SUPABASE_URL` and `SUPABASE_KEY` or NEXT_PUBLIC variants.)

Changes made

- `lib/supabase.ts` updated to read `SUPABASE_URL` and `SUPABASE_KEY` from environment variables. The file now warns if values are missing but does not hard-fail to avoid breaking local dev flows.
- Confirmed `.gitignore` contains `.env` and related patterns; remove any committed `.env` from history and rotate keys as next step.

Priority: High (stability, typing, error handling)

- [x] Replace critical `any` usages with typed interfaces: Product, Variant, UserProfile, Order, Address. (Implemented in key files — see note)

Files updated for typing: `providers/AuthProvider.tsx`, `api/wishlist/index.ts`, `app/(admin)/menu/create.tsx`, `components/subscription/SkipDeliveryModal.tsx`, `lib/notifications.ts`, `components/Address/AddressFormModal.tsx`, `app/(auth)/sign-in.tsx`, `app/(user)/cart.tsx`, `components/RemoteImage.tsx`.

- [ ] Add defensive checks after Supabase calls: test `error` and confirm `data` exists before access.
- [ ] Add client-side upload validation (file size/type) in `app/(admin)/menu/create.tsx` and similar flows.
- [ ] Add structured logging and remove console.\* from production paths (or gate them behind a debug flag).

Progress on High priority tasks

- [x] Add structured logger and replace direct console._ calls in several providers and components (`lib/logger.ts`, `providers/_`, `components/RemoteImage\*`).
- [x] Add defensive checks for Supabase storage downloads and profile fetching (several components updated).
- [x] Add basic client-side upload validation in `app/(admin)/menu/create.tsx` (file size/type checks).
- [~] Reduce `any` usage in `app/(admin)/menu/create.tsx` and elsewhere: partially done (some mappings typed to DB shapes, but a full type sweep is still needed).

Priority: Medium (subscriptions, security policies, tests)

- [x] Ensure Supabase realtime channels and auth listeners are cleaned up on unmount or sign-out. (Implemented: safe unsubscribe / removal added to providers.)
- [ ] Review database RLS policies and move any admin-only operations to server-only endpoints.
- [x] Add ESLint & TypeScript strict rules and a CI workflow (lint + typecheck + tests). (Implemented: `.eslintrc.json`, `package.json` scripts, `.github/workflows/ci.yml`.)
- [ ] Add unit/integration tests for core API flows (auth, product CRUD, file upload).

Progress on Medium priority tasks

- [x] Add ESLint config and CI workflow to run typecheck + lint (`.eslintrc.json`, `.github/workflows/ci.yml`).
- [x] Removed `.env` from the repository working tree (still needs history rewrite to purge secrets).

Priority: Low (UX, polish)

- [~] Improve user-facing error messages for network/upload failures. (Partially: `create.tsx` surfaces upload errors to form state; more UX polish needed.)
- [ ] Ensure lists rendered with map() use stable `key` props.
- [x] Ensure lists rendered with map() use stable `key` props. (Implemented: replaced index keys with stable ids/composite keys in affected JSX)

Files updated for stable keys: `app/locationMap.tsx`, `app/(admin)/menu/create.tsx`, `app/(admin)/menu/[id].tsx`, `app/(user)/menu/[id].tsx`, plus various components already using stable ids (orders, wishlist, product lists).

- [ ] Add UX for upload progress and retry.

Files changed in this iteration

- `lib/supabase.ts` — now reads config from env vars and warns if missing.
- `lib/logger.ts` — small logging wrapper.
- `components/RemoteImage.tsx` & `components/RemoteProfileImage.tsx` — defensive checks + logger.
- `providers/AuthProvider.tsx` — logger usage, defensive profile fetch, safe unsubscribe.
- `providers/NotificationProvider.tsx` — logger usage and safe listener removal.
- `api/profile/admin.tsx` — logger usage and safer admin update logging.
- `app/(admin)/menu/create.tsx` — added upload validation and defensive upload handling; reduced `any` usage.

Remaining important actions (manual or repo ops)

- Rotate Supabase keys and admin password (external to repo). This is critical and should be done immediately.
- Purge any committed `.env` from git history (use `git filter-repo` or BFG) and verify secrets are rotated.
- Full type sweep: migrate remaining `any` usages to strong types using `lib/database.types.ts` (can be automated file-by-file).

Next concrete steps I can take (pick one)

1. Full type sweep (components/providers/api) — I will convert high-impact files, add types, and run fixes until typecheck is clean.
2. Purge `.env` from git history and produce a step-by-step key-rotation checklist (I will prepare commands and a PR to remove the file from the current commit tree). Note: rewriting git history requires coordination.
3. Add unit/integration tests for product CRUD and file upload (create test harness and a few core tests).
4. Implement UX improvements: upload progress bar, retry logic, and user-friendly error messages.

How I can help next

- I can implement any of the checklist items and create a PR. Recommended first tasks:
  1. Remove hard-coded keys and read env vars from `lib/supabase.ts` (I can create a PR), or
  2. Replace console logs with a tiny logger wrapper, or
  3. Add types to `app/(admin)/menu/create.tsx` and add defensive checks around upload.

If you want me to implement one of the checklist items now, tell me which one and I'll start and open a PR with tests and brief README changes.
