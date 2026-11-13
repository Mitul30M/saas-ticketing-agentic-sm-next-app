# Phase 0 — Groundwork

Read: `plans/PLAN.md` §2.2, §5, §7; API guide §8. Next 16 docs: `08-caching.md`,
`migrating-to-cache-components.md`, `05-server-and-client-components.md`.

## Checklist

- [x] `.env.local.example` with `NIMBUS_API_URL` + `AGENT_TOKEN` placeholders (no secrets);
      `.env.local` gitignored and present locally for dev.
- [x] `lib/api-types.ts` — enums + response interfaces copied from API guide §8, verbatim intent.
      No `any`, no casts.
- [x] `lib/format.ts` — `money(cents)`, `relative(iso)`, `duration(ms)`, `numeric(v)`, `shortId(id)`,
      `formatDate(iso)`, `formatDateTime(iso)`, `percent(v)`. All string numerics normalised here.
- [x] `lib/status.ts` — status/priority/queue/outcome/approvalKind/actionStatus maps returning
      `{label, variant}` using preset badge variants; `escalationCopy(code)` friendly + raw fallback;
      `flagCopy`; terminal-state helper.
- [x] `lib/proxy-allowlist.ts` — pure matcher for the console allow-list (no `admin/*`).
- [x] Vitest installed (`pnpm add -D vitest`), `pnpm vitest run` script, tests for every helper
      above (money, relative, duration, numeric, status maps, escalation fallback, allow-list).
- [x] Root `app/layout.tsx` — metadata "Nimbus agent console", fonts kept, token-based body.
- [x] Starter `app/page.tsx` removed/replaced by a redirect to `/submit`.
- [x] `lib/nimbus.ts` server client — typed `request<T>`, `ApiError` `{status, detail}`,
      string + Pydantic error normalisation, `import "server-only"`.
- [x] Shared `ApiError` / error-mapping helper (`lib/api-error.ts`) usable by server + client.

## Evidence / DoD

- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass.
- `pnpm vitest run` green with ≥ 20 assertions across helpers.
- `lib/api-types.ts` compiles and matches guide §8 field-for-field.

## Commit

`phase-0: add typed API contract, formatters, status maps and tests`
