# Clinic visual system and delivery status

The approved warm off-white, navy/teal and mint palette, Manrope/DM Sans typography, flowing mobility logo/favicon, responsive layout and reduced-motion rules are preserved.

Source-confirmed service keys/default prices and clinic contacts now replace fictional content. Generated images remain labelled illustrative. Fabricated testimonials and demo booking/admin records have been removed. Online booking and admin fail closed with unavailable states because the existing backend is not linked; this is not a completed production integration.

Key files: `src/styles.css` (unchanged visual system), `src/components/clinic/site-layout.tsx` (navigation/identity), `src/lib/clinic-data.ts` (confirmed services/FAQ), `src/routes/index.tsx` (home/contact), `src/routes/services.$serviceId.tsx` (services), `src/routes/booking.tsx` and `src/routes/admin.tsx` (truthful unavailable states), `src/routes/__root.tsx` (metadata/fonts/favicon). See README for setup, original contracts, security prerequisites, launch checklist and export steps.
