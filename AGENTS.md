# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in .agent/PLANS.md) from design to implementation.

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
