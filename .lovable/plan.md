# Complete ASTRA-X Mission Modules

## Goal
Turn every sidebar item into a working, responsive mission-control page while preserving the existing dark ASTRA-X visual language. Upgrade the Mission Overview Earth into a fully visible rotating globe and use a more authentic astronaut presentation.

## Build
- Refactor the home dashboard onto the shared app shell so navigation and responsive behavior are consistent.
- Add a collapsible mobile navigation drawer while retaining the full desktop sidebar.
- Create a reusable animated Earth globe with atmospheric glow, visible full sphere, grid/orbit detail, drag interaction, and motion reduction support.
- Improve the crew block with the existing original astronaut artwork, better framing, and responsive health metrics.
- Create dedicated pages for Rocket Health, Astronaut Health, Neuroscience, Mission Status, Orbital Tracking, Space Environment, AI Copilot, Digital Twin, and Alerts.
- Give each page realistic telemetry panels, charts, status lists, and working page-level controls appropriate to that module.
- Connect all “View Details”, alert, and AI links to their matching pages.
- Add unique title, description, Open Graph, and Twitter metadata to every page.

## Responsive behavior
- Desktop: persistent sidebar and dense multi-column control-room layout.
- Tablet: compact navigation and reduced column counts.
- Mobile: menu-triggered navigation, stacked panels, readable charts, and controls that stay within the viewport.

## Validation
- Confirm all routes load without errors.
- Check desktop and mobile screenshots, including the rotating globe and crew area.
- Verify the newest build and browser error logs are clean.

## Technical details
- Use React/TanStack routes and existing Recharts/UI patterns.
- Implement the globe with lightweight browser graphics rather than adding a heavy map service or requiring an API key.
- Keep telemetry simulated and local; no account or database work is included.
