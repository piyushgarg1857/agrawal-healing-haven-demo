import { Activity, Bone, HeartPulse, PersonStanding, Accessibility, Dumbbell } from 'lucide-react'
export const services = [
 {id:'pain-management', name:'Pain management', short:'Find a more comfortable way to move.', description:'An individual assessment of back, neck and joint discomfort, followed by a care plan built around your everyday needs.', icon:Bone, price:800, duration:45},
 {id:'sports-rehabilitation', name:'Sports rehabilitation', short:'Get back to the activities you love.', description:'A progressive approach to movement, strength and activity after a sports-related injury.', icon:Dumbbell, price:1000, duration:60},
 {id:'post-operative-care', name:'Post-operative care', short:'Support for your next step in recovery.', description:'Guided rehabilitation aligned with your surgeon’s advice and your current stage of recovery.', icon:HeartPulse, price:1000, duration:60},
 {id:'neurological-rehabilitation', name:'Neurological rehabilitation', short:'Care that moves at your pace.', description:'Movement and balance support tailored to individual neurological rehabilitation needs.', icon:Activity, price:1000, duration:60},
 {id:'posture-mobility', name:'Posture & mobility', short:'Make everyday movement feel easier.', description:'Assessment and guided exercises focused on posture, flexibility and everyday movement habits.', icon:PersonStanding, price:800, duration:45},
 {id:'geriatric-physiotherapy', name:'Geriatric physiotherapy', short:'Move with confidence, at every age.', description:'Individual support for strength, balance and functional movement in older adults.', icon:Accessibility, price:800, duration:45},
]
export const faqs = [
 ['What happens at my first appointment?', 'Your physiotherapist will discuss your concerns, relevant medical history and movement goals, then carry out an assessment. You can ask questions before agreeing on the next steps.'],
 ['Do I need a doctor’s referral?', 'Referral requirements may depend on your condition and the clinic’s policies. Please check with the clinic before booking, and bring any relevant referral or medical reports.'],
 ['What should I bring and wear?', 'Wear comfortable clothing that allows movement. Bring relevant scans, reports, prescriptions and any referral documents.'],
 ['How do appointment payments work?', 'The proposed flow uses UPI followed by manual transaction verification. Submitting a transaction reference does not confirm payment or an appointment. Clinic staff review the reference before confirming. No payment is collected in this demo.'],
 ['How many sessions will I need?', 'This depends on your assessment, needs and response to care. Your physiotherapist can discuss a proposed plan; results and recovery timelines vary.'],
]
export const demoBookings = [
 {id:'DEMO-1042', name:'Demo patient A', service:'Pain management', date:'14 Oct 2026', time:'09:00 AM', amount:800, status:'Pending', payment:'Awaiting verification', reference:'DEMO-UPI-1042'},
 {id:'DEMO-1041', name:'Demo patient B', service:'Sports rehabilitation', date:'14 Oct 2026', time:'10:00 AM', amount:1000, status:'Confirmed', payment:'Verified', reference:'DEMO-UPI-1041'},
 {id:'DEMO-1040', name:'Demo patient C', service:'Posture & mobility', date:'14 Oct 2026', time:'11:30 AM', amount:800, status:'Pending', payment:'Not submitted', reference:'—'},
 {id:'DEMO-1039', name:'Demo patient D', service:'Post-operative care', date:'15 Oct 2026', time:'02:00 PM', amount:1000, status:'Confirmed', payment:'Verified', reference:'DEMO-UPI-1039'},
 {id:'DEMO-1038', name:'Demo patient E', service:'Geriatric physiotherapy', date:'15 Oct 2026', time:'04:00 PM', amount:800, status:'Cancelled', payment:'Not submitted', reference:'—'},
]
