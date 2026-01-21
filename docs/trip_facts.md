# Trip Facts (Single Source of Truth)

This file contains only factual trip details and the high-level planned structure. It excludes restaurant ideas, activity suggestions, and other non-booked items.
Booked details must be sourced from parsed confirmation emails in `emails/md/` only.
To render a fully substituted view with secrets, run: `scripts/render_trip_facts.py` (stdout).

## Trip frame
- Travel dates (flight schedule): Depart IAH Sat Feb 7, 2026; return to IAH Fri Feb 27, 2026
- In-Italy dates (by arrivals/departures): Arrive FLR Sun Feb 8, 2026; depart FLR Fri Feb 27, 2026
- Base city: Florence, Italy
- Base area: Oltrarno (San Frediano)
- Work block: 5:00–10:00 PM for Weeks 1–2 only
- Week 3 (final week before departure): no work block

## Lodging (booked)
- San Pier Novello in Oltrarno (Booking.com)
  - Confirmation: 5107531117
  - PIN: {{BOOKING_COM_PIN}} (needed to modify/cancel in Booking.com)
  - Address: Via Romana 26, Primo piano, Santo Spirito, 50125 Florence, Italy
  - Check-in: Sunday, February 8, 2026 (2:00 PM–8:00 PM)
  - Check-out: Monday, February 9, 2026 (12:00 AM–10:00 AM)
  - Guests: 2 adults
  - Room: 1 night, Double Room (breakfast included)
  - Property phone: +39 380 775 7786
  - Amount paid: €110.40 (paid Jan 7, 2026 via PayPal)
  - Total price: €122.40 (includes VAT and city tax; Booking.com paid €9.60)
  - City tax due at property: €12 (€6 per person per night)
  - Cancellation policy: free until January 31, 2026 11:59 PM (CET); €120 from Feb 1, 2026
- Orto Apartment in Oltrarno (Airbnb)
  - Confirmation: HMCNTHAE39
  - Listing: Orto Apartment in Oltrarno (entire home/apt)
  - Host: Tommaso
  - Host phone: +39 347 015 8670
  - Address: Via dell'Orto 31, 50124, Florence, Tuscany, Italy
  - Check-in: Monday, February 9, 2026 (after 3:00 PM)
  - Check-out: Friday, February 27, 2026 (by 10:00 AM)
  - Guests: 2 adults
  - Total paid: $1,649.77 (Google Pay; paid Jan 6, 2026 at 7:25:27 PM CST)
  - Price breakdown: $87.07 x 18 nights ($1,567.25) + $205.41 service fee + $98.18 taxes - $221.07 weekly discount
  - Cancellation policy: free for 24 hours; then non-refundable

## Flights (booked)
- Trip provider: Chase Travel
  - Trip ID: 1011716430
  - Airline confirmation (PNR): {{AIRLINE_PNR}}
  - Travelers: 2
  - Total trip cost: $1,980.26
  - Charged to card: $1,142.25 (card last-4: {{CARD_LAST4}})
- Outbound: IAH -> FLR
  - Depart: Sat Feb 7, 2026 at 4:05 PM (IAH)
  - Arrive: Sun Feb 8, 2026 at 11:25 AM (FLR, next-day arrival)
  - Flights: DL 8667 (Airbus A350-900 XWB, operated by Air France); DL 8593 (operated by Air France)
- Return: FLR -> IAH
  - Depart: Fri Feb 27, 2026 at 6:50 AM (FLR)
  - Arrive: Fri Feb 27, 2026 at 1:55 PM (IAH)
  - Flights: DL 8565 (operated by Air France); DL 8707 (Airbus A350-900 XWB, operated by Air France)

## Key transit hubs (facts for wayfinding)
- Firenze Santa Maria Novella (SMN) — Piazza della Stazione
- Florence Bus Station (SMN area) — Via Santa Caterina da Siena
  - Source: docs/lodging_and_addresses.md

## General structure (planned, not booked)
- Week 1 (Feb 7–15): Explore Florence on weekdays; 1 day trip on the weekend (considering Venice, Tuscany/Chianti, Rome)
- Week 2 (Feb 16–22): Explore Florence on weekdays; 1 day trip on the weekend (considering Venice, Tuscany/Chianti, Rome)
- Week 3 (Feb 23–27): Explore Florence; 1–2 additional day trips (leftovers from the list or something new)

## Planned day trips and anchors (not booked)
- Rome day trip
- Tuscany/Chianti day trip
- Venice day trip

## Interests & activity themes (all locations)
- Culinary focus: food markets, local specialties, cooking/food experiences
- Shopping (light): leather markets/shops in Florence; interesting local markets elsewhere
- Museums and art
- Major attractions / landmark sights

## Open discrepancies to resolve
- None outstanding after confirmations were added from receipts.
