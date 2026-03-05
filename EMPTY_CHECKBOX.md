---
# Repo Audit — Action Checklist

Generated: 2026-02-27

This file contains a compact audit summary and an actionable checklist (empty checkboxes) you can use to track remediation work.

## High-level checklist

- [ ] Remove hard-coded secrets from repository and rotate keys (supabase, README, any other leaks)
- [ ] Move runtime config to env vars and EAS/CI secrets (add `.env.example` and documentation)
- [ ] Add defensive checks around Supabase responses and storage downloads
- [ ] Fix `RemoteImage.tsx` to use a reliable RN-compatible download flow (expo-file-system / base64)
- [ ] Add tests for date logic (`getSubscriptionEndDate`) and `generateBillHTML`
- [ ] Harden listener/subscription cleanup and guard `.remove()` calls
- [ ] Normalize enum/status values at API boundary (avoid mixed-case bugs)
- [ ] Add client-side upload validation + UX (progress, retry) for admin uploads
- [ ] Centralize logging and integrate production error reporting (Sentry or similar)
- [ ] Add CI: lint, typecheck, tests, and secret scanning

## Short findings (keeps key details)

- Secrets committed: `lib/supabase.ts` contains an anon key; README contains tokens. Rotate now.
- `supabase.ts` defines a SecureStore adapter but the client uses AsyncStorage — clarify and use one storage method.
- `RemoteImage.tsx` uses FileReader and has a dead `if (!image) {}` block — replace with expo-file-system base64 flow.
- `generateBillHTML` uses non-null assertions and property access that can throw if DB shape changes; add guards and safe defaults.
- `date-format.ts` uses manual arithmetic and `toISOString()` which may be timezone-sensitive — consider dayjs/date-fns and add unit tests.

## Next steps you can ask me to run

- [ ] I will replace hard-coded Supabase config with env-var reads and add runtime warnings.
- [ ] I will implement `RemoteImage.tsx` fix (expo-file-system + base64) and add a small test.
- [ ] I will add unit tests and a CI workflow to run lint/typecheck/tests.

---

If you want, pick one of the next steps and I'll implement it and open a PR with tests and a short README update.

---

I'll audit the repo for bugs, risky patterns, and practical improvements; below is a short checklist, a concise progress update (what I scanned), and prioritized findings + concrete suggestions you can act on or ask me to implement.

Checklist (requirements)

Find bugs and loopholes across the codebase.
Give suggestions for improvement (prioritized + concrete).
(Optional next) Implement fixes / open PRs if you want me to.
Quick progress update

I scanned high-priority files and project-wide patterns (reads: supabase.ts, RemoteImage.tsx, locationMap.tsx, date-format.ts, billTemplate.ts, logger.ts, IMPROVEMENTS.md, plus earlier repo search hits).
Next: I can implement selected fixes (e.g., remove hard-coded keys, add defensive checks, tests) — tell me which to start.
Findings (priority order) — bugs / loopholes with file references and recommended fixes

Critical — Secrets and credentials committed
Files: supabase.ts (hard-coded Supabase URL + anon key), readme.md / readme.md contains tokens/passwords.
Risk: Public exposure / unauthorized access.
Fix: Move all keys to env variables (EAS/Expo config or .env + build-time secrets). Remove keys from repo and rotate credentials immediately. Add .env.example and .gitignore entries; prefer secrets manager (EAS secrets, CI vault).
Quick action I can take: extract values to process.env.EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY + add runtime warning if missing.
High — Supabase storage / auth config inconsistent & insecure usage
File: supabase.ts
Issues:
An ExpoSecureStoreAdapter is defined but not used anywhere (createClient uses AsyncStorage instead). This is confusing and may leak sessions to AsyncStorage.
createClient is constructed with a hard-coded anon key.
Fix:
Decide and use one secure storage strategy (prefer expo-secure-store for sensitive tokens) and wire it into Supabase auth storage or use recommended pattern for mobile. If you keep AsyncStorage, remove unused adapter.
Read config from env and add runtime check/warning if missing.
Critical/High — Sensitive info in docs & commit history
Files: readme.md, IMPROVEMENTS.md (references to keys & secrets).
Fix: scrub history if necessary; at minimum remove secrets and rotate keys.
High — Unsafe assumptions / missing defensive checks around external data
Files: billTemplate.ts, many API hooks (e.g., index.tsx)
Examples:
generateBillHTML accesses order.order_items, item.variant_price, order.subscription!.start_date with non-null assertions — can crash if data is missing or shaped differently.
RemoteImage.tsx assumes data from supabase.download has a type that FileReader can parse; uses item.variant_price.toFixed(2) without guard.
Fix:
Add type guards and runtime checks before accessing nested properties.
Use optional chaining and safe defaults. E.g., const price = Number(item.variant_price ?? 0); price.toFixed(2).
Return safe HTML/message if required data absent.
Medium — Remote image download may not work cross-platform
File: RemoteImage.tsx
Issues:
Using FileReader in RN environment can be unreliable. The supabase download returns a blob/response — handling differs between web and RN.
There's an empty if (!image) { } block — dead code.
Fix:
Use the recommended RN approach: download to local FS (expo-file-system), create an object URL or use base64 via FileSystem.readAsStringAsync + base64 option, then set uri: 'data:image/...;base64,' + base64.
Add fallbacks and timeouts. Remove dead code.
Medium — Date handling and possible off-by-one/timezone bugs
File: date-format.ts
Issues:
Manual date arithmetic and using toISOString().split("T")[0] can be fragile across time zones.
getSubscriptionEndDate uses +6 and +29 days — clarify whether inclusive/exclusive.
Fix:
Use date-fns or dayjs for clear, timezone-safe operations. Add unit tests for getSubscriptionEndDate and edge cases (leap years, DST, local time).
Medium — Event listener / subscription cleanup risks
Files: NotificationProvider.tsx, various places with listeners
Issues:
Listeners are removed inside try/catch; ensure variables exist (not undefined) before calling .remove(); some implementations call .remove() even if registration failed.
Fix:
Use returned subscription object types; guard with if (notificationListener) or notificationListener?.remove?.().
Medium — Mixed casing & enum mismatches
Files: types.ts, OrderListItem.tsx
Issues:
OrderStatus uses 'New' | 'Cancelled' | ... but code normalizes to .toLowerCase() (normalizeStatus) and expects lowercase keys in statusColorMap. Inconsistent casing can create mapping bugs.
Fix:
Normalize status mapping at type boundary (convert DB value to internal enum). Use a single canonical enum/type.
Low — UX & error handling
Examples:
Using alert() for platform-level errors (e.g., push token failure) is disruptive; prefer in-app error UI or logging for non-critical errors.
create.tsx uses any in a few places and has upload paths that lack client-side validation (file size/type) — mentioned in IMPROVEMENTS.md.
Fix:
Replace alert with a unified error modal / toaster. Implement file validation and retry for uploads, show upload progress.
Low — Logging and console usage
File: logger.ts
Issues:
error always prints in production; log gated by NODE_ENV but RN bundling may not set process.env.NODE_ENV reliably.
Fix:
Use a single logger wrapper with levels and opt-in remote error reporting (Sentry) for production. Ensure NODE_ENV detection works on RN or use a config flag.
Low — Misc style / small bugs
LocationMapScreen debounce ref type may cause TS issues across environments — fine but consider using a custom debounce util.
maps.ts calls Linking.openURL without canOpenURL check — consider gracefully handling failure.
Concrete, prioritized suggestions (actionable)

Immediate (critical)
Remove hard-coded keys from supabase.ts and readme.md. Rotate Supabase keys now.
Replace with env vars (EAS/Expo secure config). Add .env.example, update README with setup steps.
Very near-term
Add runtime checks in generateBillHTML, RemoteImage, and other places where nested properties are assumed. Add unit tests for generateBillHTML and getSubscriptionEndDate.
Fix RemoteImage to use expo-file-system base64 or proper blob handling on RN.
Medium-term
Centralize and harden logging. Integrate Sentry or similar for production error capture.
Add form/file validation + progress + retry UX in admin upload flows.
Longer-term / quality
Add stricter TypeScript rules (noImplicitAny, stricter checks), linting, and pre-commit hooks (lint, typecheck, tests).
Add automated tests for billing, date logic, and API hooks (mock supabase).
Add CI (GitHub Actions) to run lint + typecheck + tests and fail on secrets present (git-secrets or truffleHog check).
Improve date handling with date-fns or dayjs consistently.
Suggested small improvements I can implement now (pick any)

Replace hard-coded Supabase config to use env vars + runtime guard (safe, small change).
Make RemoteImage robust with expo-file-system fallback and remove dead code.
Add defensive guards to generateBillHTML to avoid runtime crashes and add a small unit test for edge case. Tell me which one to start and I'll open a patch/PR with tests and a short README snippet.
Requirements coverage

Find bugs/loopholes: Done (see findings list, prioritized).
Suggestions for improvement: Done (concrete fixes and roadmap).
Offer to implement: Ready (choose an item and I will implement).
If you'd like, I can:

Start by editing supabase.ts to read env vars and add runtime warnings + update README (fast, high-impact), or
Fix RemoteImage.tsx to robustly handle downloads and fallbacks.

## Implementation plan

Use this section as the working plan for implementing the checklist. Each top-level item is broken into small PR-sized tasks with file targets. Mark the sub-items as you complete them.

1. Remove hard-coded secrets and move config to env
   - [ ] Create `.env.example` with keys: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] Update `lib/supabase.ts` to read from env and emit a runtime warning if missing
     - File: `lib/supabase.ts`
     - Note: do NOT commit real keys; rotate keys after this change
   - [ ] Update `readme.md` with setup steps (how to configure env / EAS secrets)

2. Fix RemoteImage storage handling
   - [ ] Replace `FileReader` usage with `expo-file-system` base64 download for RN
     - File: `components/RemoteImage.tsx`
   - [ ] Add defensive guards and fallback to `fallback` image
   - [ ] Add a small unit or integration test to assert fallback path

3. Harden billing & date logic
   - [ ] Add guards in `utils/billTemplate.ts` for missing `order_items`, `variant_price`, and subscription fields
   - [ ] Add tests for `getSubscriptionEndDate` and billing edge cases (skipped days, zero items)
     - File: `lib/date-format.ts`, `utils/billTemplate.ts`, `__tests__/billing.test.ts`

4. Listener cleanup & logging
   - [ ] Guard `.remove()` calls and only call if objects are present
     - Files: `providers/NotificationProvider.tsx`, `providers/AuthProvider.tsx`
   - [ ] Replace console.\* usage with `lib/logger.ts` and wire NODE_ENV detection (or config flag)

5. Quality gates (CI)
   - [ ] Add GitHub Actions workflow to run: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`
   - [ ] Add secret-scan step (git-secrets or truffleHog) to fail on accidental leaks

Optional commands (copy only if you intend to run locally)

```bash
# Install deps (if needed)
npm ci

# Run lint/typecheck/tests
npm run lint
npm run typecheck
npm test
```

---

If you want I can implement any one of these steps now (small PR): say which one and I'll start (I recommend first: `lib/supabase.ts` env-var migration).
