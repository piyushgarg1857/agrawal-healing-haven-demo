# Dr. Agrawal’s Physiotherapy Centre — visual reference

## Visual system
- Warm off-white page surfaces, deep navy text, deep teal actions and restrained mint accents.
- Manrope headings and DM Sans body text; readable contrast, editorial spacing and compact 6px cards.
- An original flowing human/mobility logo is the active identity. An alternative interlocking-joint concept remains in the assets for comparison. The active logo also supplies a 64px favicon.
- Subtle logo entrance/hover and service-card motion respect reduced-motion preferences.
- The first-screen headline names the clinic directly, with keyboard skip navigation, visible focus states and a compact mobile menu.
- Generated physiotherapy imagery is clearly labelled illustrative, not presented as the actual clinic or team.

## Pages and interactions
- `/`: clinic landing page, six service concepts, patient journey, clinic trust section, illustrative patient voices, FAQ and contact section.
- `/services/$serviceId`: individual care pages, assessment expectations and illustrative session pricing.
- `/booking`: four-stage service, date/time, fictional contact details and request-review flow. UPI is explained, not collected. Final state distinguishes unpaid requests from manual-review requests.
- Booking step changes move keyboard focus to the new content; fictional movement goals survive Back/Next navigation and appear in review. The mobile menu closes with Escape and returns focus to its control; admin review dialogs have an accessible title.
- `/admin`: fictional records, search, status filters, a payment-review queue and simulated verification/clarification/cancellation actions.

## Key files
- `src/styles.css`: semantic palette, typography, layouts, responsive rules and reduced-motion support.
- `src/components/clinic/site-layout.tsx`: shared logo, navigation, page introductions and footer.
- `src/routes/index.tsx`: landing page.
- `src/routes/services.$serviceId.tsx`: service detail view.
- `src/routes/booking.tsx`: transient demo booking flow.
- `src/routes/admin.tsx`: transient demo admin workflow.
- `src/lib/clinic-data.ts`: illustrative services, FAQ and fictional records.
- `src/assets/physio-hero.jpg`, `src/assets/logo-motion.png`, `src/assets/logo-joint.png`: visual assets.
- `public/favicon.png`: active favicon; `src/routes/__root.tsx` loads the fonts and icon.

## Boundaries and clinic approval
This Lovable project is a design reference only. It is not connected to the existing backend, booking records, patient data or UPI payments. No live database or payment integration was created or modified. The original external repository was not accessed or replaced.

### Porting to the existing static HTML/CSS/JS site
The existing live booking and admin functions must be retained unchanged when applying this design. Port the palette, spacing, logo, layout and presentation onto the original pages while preserving existing form field names, element IDs used by scripts, validation, event handlers, booking calls, admin access checks and manual payment verification. The transient demo handlers in this reference are not replacements for those live functions. No source-site port is performed here; it requires access to the original site and regression checks against its existing contracts. No new dependencies were added for this refinement.

Service offerings, demo prices, actual clinic/team photographs, therapist credentials, contact details, location, opening hours, payment recipient and operational policies all require clinic verification before a real launch. Contact details are deliberately not fabricated. Illustrative testimonials are not real patient reviews. No clinical ratings or guaranteed outcomes are asserted.

## Verification
Desktop and mobile pages were inspected. The complete fictional booking flow and simulated admin payment confirmation were exercised. Mobile navigation, service metadata and horizontal overflow checks passed. Existing routing tests passed. A low-contrast appointment-link issue and crowded mobile concept label were found and corrected during visual review.
The refinement was checked at desktop, 390px and 320px widths, including keyboard skip navigation, Escape-to-close navigation, booking step focus, preserved movement goals, full fictional request and admin verification, and reduced-motion styling; no browser runtime errors were observed.