# Research Plan: Day Trips Booking Package

[Back to Day Trips Index](./README.md)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

This plan must be maintained in accordance with .agent/PLANS.md from the repository root.

## Purpose / Big Picture

The goal is to produce booking-ready research materials for every item in docs/day_trips_todo.md. After completing this plan, a novice can open the new docs/day_trips_todo folder, pick the relevant trip, and have all required booking details (transport, activities, tours) to complete bookings using only a web browser and the information provided.

## Progress

- [x] (2026-01-21 1:10amZ) Confirmed dates, scope, and fallback rules for Rome, Venice, Chianti, and the open-ended Week 3 trip.
- [x] (2026-01-21 1:20amZ) Researched transport options first (Trenitalia and Italo) and captured typical durations for Rome and Venice day trips.
- [x] (2026-01-21 1:35amZ) Researched Rome booking requirements: Colosseum official tickets and one optional timed-entry idea.
- [x] (2026-01-21 1:45amZ) Researched Venice booking requirements: gondola booking guidance and two optional timed-entry ideas.
- [x] (2026-01-21 2:0amZ) Researched Chianti wine tour options (full day with transport) and compiled booking-ready operator options.
- [x] (2026-01-21 2:15amZ) Created docs/day_trips_todo folder structure and wrote booking-focused markdown files for each trip.
- [x] (2026-01-21 2:20amZ) Validated that files are booking-ready and aligned with docs/day_trips_todo.md.
- [x] (2026-01-21 3:10amZ) Added decision guidance and target train time windows for Rome/Venice and added Chianti tour recommendations.

## Surprises & Discoveries

- Observation: Colosseum tickets are nominative and name changes are only allowed once up to seven days before the visit date.
  Evidence: Official Colosseum ticket rules (see Rome activities file sources).

- Observation: Venice gondola tariffs are fixed citywide by the Comune, with separate day/night durations and rates.
  Evidence: Comune di Venezia gondola tariffs page.

## Decision Log

- Decision: Use docs/trip_facts.md as the single source of truth for dates and constraints, and docs/day_trips_todo.md for scope.
  Rationale: Matches repo instructions and user guidance.
  Date/Author: 2026-01-21 / Codex

- Decision: Research transport first, then activities/tours, so later choices reflect actual travel time.
  Rationale: User requested transport research priority and time awareness.
  Date/Author: 2026-01-21 / Codex

- Decision: Include 1-2 optional bookable ideas per trip, flagged as optional and time-permitting.
  Rationale: User asked to earmark additional ideas without expanding into a full itinerary.
  Date/Author: 2026-01-21 / Codex

- Decision: Keep Week 3 open-ended trip out of scope except for the date.
  Rationale: User explicitly reserved planning for their wife in a later thread.
  Date/Author: 2026-01-21 / Codex

- Decision: Use Italo route pages for published fastest travel times and Trenitalia for booking access.
  Rationale: Official sources provide the most reliable time expectations while still allowing either operator for booking.
  Date/Author: 2026-01-21 / Codex

- Decision: Provide two small-group Chianti tour options and one private option, all with transport details.
  Rationale: User requested research across options without committing to a single operator.
  Date/Author: 2026-01-21 / Codex

- Decision: Provide target train time windows rather than exact departures because schedules are live and operator sites must be consulted at booking time.
  Rationale: Keeps guidance practical while avoiding stale time commitments.
  Date/Author: 2026-01-21 / Codex

## Outcomes & Retrospective

Created booking-only materials under docs/day_trips_todo with per-trip folders and files for transport, activities, and tours. Each file contains booking essentials and official sources. The Week 3 open-ended trip is explicitly out of scope beyond the date. Remaining work is only to execute the bookings and update status in docs/day_trips_todo.md.

## Context and Orientation

Trip details live in docs/trip_facts.md and the outstanding day-trip tasks live in docs/day_trips_todo.md. This work will not change trip_facts and will only add booking reference materials. The new output will live in docs/day_trips_todo/ with one subfolder per trip. Each trip folder will contain markdown files focused only on bookable items: transpo.md for transport, activities.md for timed-entry or bookable activities, tours.md for guided tours, and a short README.md describing the booking scope and date. The Week 3 open-ended trip will have files that explicitly state it is out of scope beyond the fixed date.

## Plan of Work

First, confirm the fixed dates and fallback rules for each day trip and the Week 3 open-ended day. Second, research transport options for Rome and Venice day trips from official operators (Trenitalia and Italo), capturing how to book and typical durations so time-in-city can be estimated. Third, research required activities: Rome Colosseum official ticketing and Venice gondola booking guidance from official sources, plus 1-2 optional timed-entry ideas per trip with booking links. Fourth, research full-day Chianti wine tour operators that include transport from Florence and capture meeting points, duration, inclusions, and cancellation policies. Fifth, create the docs/day_trips_todo folder structure and write booking-only markdown files for each trip and aspect.

## Concrete Steps

1) Read docs/trip_facts.md and docs/day_trips_todo.md to confirm dates and constraints.
2) Use web research to gather booking-required details, in this order:
   - Transport: Trenitalia and Italo booking pages and typical durations for Florence <-> Rome and Florence <-> Venice.
   - Rome: official Colosseum ticketing; optional bookable ideas.
   - Venice: official gondola pricing/booking guidance; optional bookable ideas.
   - Chianti: full-day tour operators with transport from Florence.
3) Create the folder docs/day_trips_todo/ with subfolders:
   - docs/day_trips_todo/rome_day_trip
   - docs/day_trips_todo/venice_day_trip
   - docs/day_trips_todo/chianti_wine_tour
   - docs/day_trips_todo/week3_open_day_trip
4) Write per-trip markdown files with only booking-relevant details:
   - transpo.md (Rome, Venice; Chianti transport note; open-ended out-of-scope note)
   - activities.md (Colosseum, gondola; optional timed-entry ideas; out-of-scope note where applicable)
   - tours.md (Chianti tour options; out-of-scope note where applicable)
   - README.md (short summary and fixed date, no general itinerary)
5) Cross-check all dates and fallback rules (Saturday preferred, Sunday fallback) and ensure no late-night commitments are implied for Weeks 1-2.

## Validation and Acceptance

Validation is complete when:
1) docs/day_trips_todo exists with four subfolders.
2) Each trip folder contains README.md plus transpo.md, activities.md, and tours.md (even if out of scope, those files must say so).
3) Each file contains booking-ready information from official or reputable sources, with clear instructions on what to book.
4) The open-ended Week 3 trip is explicitly marked out of scope beyond the date.
5) docs/day_trips_todo.md remains consistent with the dates and scope in these files.

## Idempotence and Recovery

Folder creation uses mkdir -p and is safe to rerun. File edits are additive. If a source changes mid-research, update the relevant file and add a Decision Log entry explaining the change.

## Artifacts and Notes

Expected file headings:
  - docs/day_trips_todo/rome_day_trip/transpo.md: Florence <-> Rome High-Speed Trains (Booking Essentials)
  - docs/day_trips_todo/rome_day_trip/activities.md: Rome Activities (Booking Essentials)
  - docs/day_trips_todo/venice_day_trip/activities.md: Venice Activities (Booking Essentials)
  - docs/day_trips_todo/chianti_wine_tour/tours.md: Chianti Wine Tours (Booking Essentials)

## Interfaces and Dependencies

Web research must prioritize official primary sources, including official train operators and official attraction ticketing portals. For tours, use reputable operators and clearly label them as third-party providers. List booking URLs as plain text and include short notes describing what to select and any required IDs or timing constraints. No code dependencies are required beyond adding markdown files in docs/day_trips_todo.

Change Log: Updated progress, outcomes, and status after completing research and drafting booking files.
Change Log: Aligned file list language to reflect that every trip folder includes transpo/activities/tours files (with out-of-scope notes where needed).
Change Log: Refined progress and decisions after confirming official booking sources and tour options.
Change Log: Added time-window guidance and decision rules for train timing and optional activities.
