# Physiotherapy Site Content Recommendations

## 1. Safe & Concise FAQ
*Focus on logistics and process to avoid unsolicited medical advice.*

- **What should I wear to my appointment?**
  - "Please wear loose, comfortable clothing (like athletic wear) that allows easy access to the area being assessed or treated."
- **Do I need a referral from a doctor?**
  - "No, you can book directly with us as a self-referral. However, check with your insurance provider as they may require a GP referral for reimbursement."
- **What happens during the first session?**
  - "We start with a comprehensive assessment of your medical history and physical condition, followed by an initial treatment and a personalized recovery plan."
- **How long does a session last?**
  - "Initial assessments usually take 45–60 minutes. Follow-up treatments typically last 30–45 minutes."
- **What is your cancellation policy?**
  - "We require at least 24 hours' notice for cancellations or rescheduling to avoid a late-cancellation fee."

## 2. Booking / Manual UPI Demo Language
*Clear instructions for the manual verification workflow.*

- **Payment Instruction:** "To secure your slot, please complete the payment via UPI to: `[UPI_ID_PLACEHOLDER]`. You can also scan the QR code displayed above."
- **Verification Prompt:** "Once payment is made, please enter your 12-digit UPI Transaction ID or upload a screenshot of the success screen below."
- **Status Disclaimer:** "Your booking will be held as 'Pending' and will move to 'Confirmed' once our team manually verifies your payment (typically within 1-2 hours)."

## 3. Recommended Admin Booking Statuses
- **Pending Verification:** User has submitted payment details; admin needs to check the bank/UPI statement.
- **Confirmed:** Payment verified and the appointment is officially on the schedule.
- **Awaiting Payment:** User initiated booking but has not yet provided transaction details.
- **Rescheduled:** The session time has been modified by either party.
- **Completed:** The treatment session has been successfully conducted.
- **Cancelled:** The appointment was voided (with sub-status: *By Patient* or *By Clinic*).
- **Refunded:** Payment was returned due to cancellation.

## 4. Trustworthy Language vs. Pitfalls
- **DO:** Use terms like "evidence-based," "clinical assessment," "tailored recovery," and "management of symptoms."
- **AVOID:** Making absolute claims like "100% cure," "instant pain relief," or "guaranteed results."
- **PLACEHOLDERS:** Always use `[Clinic Name]`, `[Registration Number]`, and `[Contact Info]` instead of inventing dummy data to ensure the design remains a neutral template.
