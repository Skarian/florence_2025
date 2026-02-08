# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in .agent/PLANS.md) from design to implementation.

# Continuity

- `plans/continuity.md` is the running continuity log for this repo (local-only and gitignored by design).
- At the start of any substantive task, and any time work is resumed after a pause, read `plans/continuity.md` first.
- Keep `plans/continuity.md` up to date as work progresses, especially when phase status, key decisions, quality gates, or next steps change.
- Before ending a substantial work session, update `plans/continuity.md` with current status, what changed, and concrete next actions.

# Trip Facts Source of Truth

- `docs/trip_facts.md` is the single source of truth for booked trip details (flights, lodging, confirmations, payments).
- This file is gitignored due to sensitive details; update it directly when bookings change or new receipts are added.
- Only add booked details to `docs/trip_facts.md` after parsing confirmation emails into `emails/md/`. Do not add booked facts from other sources.

# Email Parsing (receipts -> facts)

- Raw receipts live in `emails/` as `.eml` files.
- Converted Markdown lives in `emails/md/` (also gitignored via `/emails/`).
- Convert using the local CLI:
  - `eml2md -i <input.eml> -o <output.md> [-f <format>]`
  - Installed binary used here: `/Users/nskaria/projects/eml2md/target/release/eml2md`
- After conversion, extract booking facts from `emails/md/` and update `docs/trip_facts.md`.

# Secrets (lookup table)

- Secrets live in `secrets/values.env` (gitignored).
- Render a fully substituted view of `docs/trip_facts.md` with:
  - `scripts/render_trip_facts.py` (stdout)
