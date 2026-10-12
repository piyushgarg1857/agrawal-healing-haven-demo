import { Activity, Bone, HeartPulse, Accessibility, Dumbbell } from "lucide-react";
export const services = [
  {
    id: "consultation",
    name: "Consultation",
    short: "Find a more comfortable way to move.",
    description:
      "An individual assessment of back, neck and joint discomfort, followed by a care plan built around your everyday needs.",
    icon: Bone,
    price: 500,
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal physiotherapy",
    short: "Get back to the activities you love.",
    description:
      "Assessment and care for muscle, joint and movement concerns.",
    icon: Bone,
    price: 800,
  },
  {
    id: "neurological",
    name: "Neurological physiotherapy",
    short: "Support for your next step in recovery.",
    description:
      "Movement and balance support tailored to neurological rehabilitation needs.",
    icon: HeartPulse,
    price: 1000,
  },
  {
    id: "pediatric",
    name: "Pediatric physiotherapy",
    short: "Care that moves at your pace.",
    description:
      "Assessment of children’s movement needs, with guidance for families.",
    icon: Activity,
    price: 700,
  },
  {
    id: "sports",
    name: "Sports physiotherapy",
    short: "Make everyday movement feel easier.",
    description:
      "Assessment and rehabilitation for sports-related movement concerns.",
    icon: Dumbbell,
    price: 900,
  },
  {
    id: "geriatric",
    name: "Geriatric physiotherapy",
    short: "Move with confidence, at every age.",
    description:
      "Individual support for strength, balance and functional movement in older adults.",
    icon: Accessibility,
    price: 600,
  },
];
export const faqs = [
  [
    "What happens at my first appointment?",
    "Your physiotherapist will discuss your concerns, relevant medical history and movement goals, then carry out an assessment. You can ask questions before agreeing on the next steps.",
  ],
  [
    "Do I need a doctor’s referral?",
    "Referral requirements may depend on your condition and the clinic’s policies. Please check with the clinic before booking, and bring any relevant referral or medical reports.",
  ],
  [
    "What should I bring and wear?",
    "Wear comfortable clothing that allows movement. Bring relevant scans, reports, prescriptions and any referral documents.",
  ],
  [
    "How do appointment payments work?",
    "UPI payments require manual transaction verification. Submitting a transaction reference does not confirm payment or an appointment. Clinic staff review the reference before confirming. Pay only to the UPI ID shown after your booking request is created.",
  ],
  [
    "How many sessions will I need?",
    "This depends on your assessment, needs and response to care. Your physiotherapist can discuss a proposed plan; results and recovery timelines vary.",
  ],
];
