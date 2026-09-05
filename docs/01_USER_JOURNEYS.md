# User Journeys

## J1 — First visit, location denied

User opens app → sees map and four actions → chooses Where can I go? → location request is explained in context → denies → postcode/place field receives focus → selects result → chooses 20 min and journey preferences → views Reach Field plus list counts → opens confidence explanation. Denial does not block any core feature.

## J2 — Personalised reach

User sets comfortable speed, maximum continuous walking, seat preference, step avoidance, hill preference, crossing preference, surface preference and toilet needs → settings save locally → app computes standard and personal reach → text states percentage only when denominator/coverage is valid → service list can be sorted by time/category/confidence.

## J3 — Easiest route

User enters origin/destination → sees Fastest and Easiest → compares time, distance, steps, maximum estimated gradient, longest rest gap, crossing evidence, toilet access, surface coverage and unknown coverage → selects Easiest → route detail mirrors map in ordered text. No turn-by-turn tracking.

## J4 — Need something

User chooses Toilets, Accessible toilet, Changing Places, Seat, Safe Place, Pharmacy, Community hub or Service → results show nearest appropriate known matches, open/closed only when current hours are reliable, and unknown facility details explicitly → user opens place detail or route comparison.

## J5 — ParkMatch

User selects requirements → results rank by satisfied evidence, then unknowns, then travel cost → match is described as `7 of 8 requested features known`, not a universal accessibility percentage → detail separates main paths from unknown secondary routes.

## J6 — Offline/failure

If API or map fails, retain entered preferences and present retry plus a non-map status. V1 may cache shell/recent responses but must not claim complete offline area download. If routing is unavailable, show places only and explain that a suitable route could not be checked.

