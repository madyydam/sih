
# ASTRA-X --- Antigravity Implementation Prompt

You are working on the existing ASTRA-X space mission dashboard.

> **IMPORTANT:** Do NOT redesign the entire UI. Do NOT change the
> existing visual identity, layout language, colors, typography, card
> style, spacing, sidebar style, or overall dashboard aesthetic unless
> required for functionality or responsiveness.

Use the provided reference screenshots as the visual reference for the
existing **Mission Overview** and **Astronaut Health** cards.

------------------------------------------------------------------------

## 1. Mission Overview --- Realistic 3D Earth

The Earth globe shown inside the Mission Overview card currently looks
like a static cropped image.

Replace it with a **real interactive/animated 3D Earth globe**.

### Requirements

-   The entire Earth globe must be visible inside the card.
-   It must **NOT be cropped** on any side.
-   The globe should look like a realistic original Earth, similar in
    visual quality and feel to Google Earth / real satellite Earth
    imagery.
-   Show realistic continents, oceans, atmospheric edge/glow, and
    night-side city lights where appropriate.
-   The Earth should slowly rotate continuously like an actual globe.
-   Rotation must be smooth and subtle, not fast or distracting.
-   Maintain the dark space aesthetic of the dashboard.
-   Add a very subtle atmospheric glow around Earth.
-   The Earth must remain centered and fully contained within the card.
-   It should automatically scale based on the card dimensions.
-   Do **NOT** simply stretch the existing Earth image.
-   Do **NOT** use a flat 2D image pretending to be a globe.
-   Use a proper WebGL/3D globe implementation if the project stack
    supports it, such as **Three.js / React Three Fiber**, CesiumJS, or
    an equivalent lightweight solution.
-   Optimize the globe so it does not unnecessarily hurt dashboard
    performance.
-   Pause or reduce animation when the component is not visible if
    appropriate.

### Visual target

The globe should feel like:

**REAL EARTH + REALISTIC SPACE LIGHTING + CONTINUOUS SLOW ROTATION +
FULL GLOBE VISIBLE + PREMIUM NASA/SPACE-DASHBOARD QUALITY**

### Preserve existing Mission Overview information

Keep the existing values and functionality:

-   **Current Position**
    -   Lat 12.34° N
    -   Lon 73.58° E
-   **Altitude**
    -   408 km
-   **Velocity**
    -   7.66 km/s
-   **Trajectory**
    -   Stable

Do not remove or break these values.

------------------------------------------------------------------------

## 2. Astronaut --- Make It Original & Realistic

The astronaut shown in the Astronaut Health card currently looks like a
generic/cartoon-style icon.

Replace it with a **high-quality realistic astronaut visual**.

### Requirements

-   Astronaut must look like a real space astronaut.
-   Use a realistic modern spacesuit.
-   Professional NASA/space-agency style appearance.
-   Realistic helmet visor and reflections.
-   Subtle lighting matching the dark dashboard.
-   No cartoon appearance.
-   No childish illustration.
-   No distorted anatomy.
-   Keep the astronaut compact enough to fit naturally inside the
    existing card.
-   Preserve the existing card structure and information.

Keep:

**Astra-1 Crew**\
**2 Astronauts · 1 Mission Specialist**\
**Stable**

The astronaut visual should feel premium and believable while matching
the existing ASTRA-X interface.

------------------------------------------------------------------------

## 3. Sidebar Navigation --- Every Link Must Work

Build functional pages/routes for **ALL sidebar navigation items**.

The following pages must exist and be accessible through the sidebar:

1.  Rocket Health
2.  Astronaut Health
3.  Neuroscience
4.  Mission Status
5.  Orbital Tracking
6.  Space Environment
7.  AI Copilot
8.  Digital Twin
9.  Alerts

Do **NOT** leave placeholder links.

Every sidebar item must:

-   Navigate to its own page/route.
-   Show an active/selected sidebar state.
-   Preserve the existing sidebar design.
-   Work on desktop, tablet, and mobile.
-   Maintain the same ASTRA-X visual language across all pages.

------------------------------------------------------------------------

## 4. Page Content

Create proper dashboard pages for each section rather than blank pages.

Each page should feel like a real ASTRA-X mission-control product.

### Rocket Health

Include:

-   Rocket/system health overview
-   Engine status
-   Fuel/propellant metrics
-   Structural health
-   Temperature
-   Pressure
-   Overall health indicator

### Astronaut Health

Include:

-   Crew overview
-   Heart rate
-   Oxygen
-   Stress/fatigue indicators
-   Sleep/recovery
-   Vital monitoring
-   Individual astronaut profiles

### Neuroscience

Include:

-   Cognitive performance
-   Brain activity visualization
-   Stress/cognitive load
-   Sleep/circadian metrics
-   Mission psychology indicators

### Mission Status

Include:

-   Mission progress
-   Mission timeline
-   Current phase
-   Mission objectives
-   System readiness
-   Key mission metrics

### Orbital Tracking

Include:

-   Large interactive Earth/orbit visualization
-   Current spacecraft location
-   Orbit path
-   Altitude
-   Velocity
-   Coordinates
-   Ground-track style information

### Space Environment

Include:

-   Radiation levels
-   Solar activity
-   Space weather
-   Temperature
-   Magnetic/environmental conditions
-   Risk indicators

### AI Copilot

Create a premium AI assistant interface with:

-   Mission intelligence
-   Ability to ask questions about mission data
-   AI recommendations
-   System insights
-   Alerts and anomaly explanations

### Digital Twin

Create:

-   Interactive spacecraft/mission digital-twin visualization
-   System components
-   Telemetry
-   Component health
-   Real-time-style metrics
-   Interactive inspection where practical

### Alerts

Include:

-   Mission alerts
-   Critical / Warning / Info categories
-   Alert timestamps
-   Severity indicators
-   Acknowledge/resolve interactions where appropriate
-   Clear alert history

------------------------------------------------------------------------

## 5. Responsive Design --- All Devices

Make the **entire application fully responsive**.

### Desktop

-   Full sidebar
-   Multi-column dashboard
-   Large visualizations
-   Proper spacing

### Tablet

-   Collapsible/sidebar adaptation
-   Cards resize intelligently
-   No horizontal overflow
-   Charts and globe scale correctly

### Mobile

-   Sidebar becomes a mobile navigation/drawer.
-   Dashboard becomes a clean single-column layout.
-   Cards stack vertically.
-   Earth globe remains completely visible.
-   Astronaut remains properly positioned.
-   Typography scales appropriately.
-   Buttons remain touch-friendly.
-   No clipped text.
-   No horizontal scrolling.
-   No broken charts.
-   No overlapping cards.
-   No elements extending outside the viewport.

### Test at minimum

-   320px
-   375px
-   390px
-   414px
-   768px
-   1024px
-   1280px
-   1440px+

------------------------------------------------------------------------

## 6. Visual Consistency

Maintain the current ASTRA-X design system:

-   Dark space-themed background
-   Blue/cyan futuristic accents
-   Subtle borders
-   Glass/technical dashboard cards
-   Clean futuristic typography
-   Small technical labels
-   Green status indicators
-   Premium aerospace / mission-control feeling

Do **NOT** introduce random colors or unrelated UI styles.

All newly created pages must look like they belong to the same
application.

------------------------------------------------------------------------

## 7. Functionality & Quality Assurance

After implementing everything:

-   Check every sidebar link.
-   Check every route.
-   Check active navigation states.
-   Check mobile navigation.
-   Check responsive layouts.
-   Check the Earth globe on every viewport.
-   Confirm the Earth is fully visible and rotating.
-   Confirm there is no image cropping.
-   Confirm the astronaut visual is properly contained.
-   Check for console errors.
-   Check for broken imports.
-   Check for missing assets.
-   Check for overflow.
-   Check that existing functionality has not been broken.

### Code quality

Do not create unnecessary duplicate components or unused code.

Reuse existing components, design tokens, layouts, and data structures
wherever possible.

If an existing component already performs the required functionality,
improve/extend it instead of replacing the entire architecture.

------------------------------------------------------------------------

# Final Goal

The final result should feel like a **real production-grade aerospace
mission intelligence dashboard**.

The Mission Overview should immediately stand out because of the **fully
visible, realistic, slowly rotating 3D Earth**.

The Astronaut Health section should use a **realistic astronaut
visual**.

Every sidebar item should lead to a **complete, polished, and functional
page**.

The entire application must work flawlessly across **desktop, tablet,
and mobile**.

Do not stop after creating the pages.

## BUILD → CONNECT → TEST → FIX → RESPONSIVE TEST → FINAL CLEANUP
