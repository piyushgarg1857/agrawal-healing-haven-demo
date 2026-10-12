// Client for the PHYSIO Supabase project.
// RLS on the hosted project is the security boundary. Never log patient fields.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// New PHYSIO project (ref ussqspqymblfruqsedzv). Publishable key is public frontend config; never use a service-role key here.
export const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] ?? "https://ussqspqymblfruqsedzv.supabase.co";
const ANON_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "sb_publishable_mcrP-q4ayHg0iVlbH_R9_Q_5T0whtF3";

export const UPI_ID = "8764336371@fam";
export const UPI_PAYEE = "Dr. Agrawal's Physiotherapy Centre";

export type BookingStatus = "pending" | "pending_verification" | "completed" | "cancelled";
export type Booking = {
  id: string | number; created_at: string; patient_name: string; patient_email: string;
  patient_phone: string; service: string; amount: number; payment_id: string | null; status: BookingStatus | string;
};
export type PriceRow = { service: string; price: number };

let client: SupabaseClient | null = null;
export function backend(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: typeof window !== "undefined", autoRefreshToken: true } });
  return client;
}

// Public booking RPCs are granted to `anon` only. A staff session stored by `backend()` would make
// supabase-js send that user's JWT (role `authenticated`, no EXECUTE) and fail with 42501, so
// patient-facing calls always use this separate, session-less client.
let publicClient: SupabaseClient | null = null;
export function publicBackend(): SupabaseClient {
  if (!publicClient) publicClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "physio-public-anon" } });
  return publicClient;
}

/** Human-readable error; never echoes patient data. */
export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
  // Validation messages raised by the booking RPCs are fixed strings that never contain input.
  if (code === "P0001" && /^(Please enter a valid [a-z ]+|Selected service is not available)$/i.test(msg)) return msg + ".";
  if (code === "42703" || code === "PGRST204" || /appointment_confirmed_at/i.test(msg)) return "Appointment confirmation is not yet enabled on the clinic system (database update pending).";
  if (code === "PGRST202" && /get_physio_booking_status/.test(msg)) return "Online status checks are not yet enabled on the clinic system. Please call the clinic.";
  if (code === "PGRST202" || /Could not find the function/i.test(msg)) return "Online booking is not yet enabled on the clinic system. Please call the clinic.";
  if (/fetch|network|Failed to fetch|resolve/i.test(msg)) return "The clinic system could not be reached. Please call the clinic or try again later.";
  if (code === "42501" || /permission|row-level security|policy/i.test(msg)) return "This action is not permitted by the clinic system's security settings.";
  if (/Invalid login/i.test(msg)) return "Email or password is incorrect.";
  if (/Email not confirmed/i.test(msg)) return "This staff account's email has not been confirmed yet.";
  if (/rate limit|too many/i.test(msg)) return "Too many attempts. Please wait a few minutes and try again.";
  return "Something went wrong. Please try again or contact the clinic.";
}

export async function getPrices(): Promise<PriceRow[]> {
  const { data, error } = await publicBackend().from("service_prices").select("service, price");
  if (error) throw error;
  return (data ?? []) as PriceRow[];
}

export async function saveBooking(input: { patient_name: string; patient_email: string; patient_phone: string; service: string }) {
  const { data, error } = await publicBackend().rpc("create_physio_booking", {
    p_patient_name: input.patient_name, p_patient_email: input.patient_email, p_patient_phone: input.patient_phone, p_service: input.service,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { booking_id: string; booking_token: string } | undefined;
  if (!row?.booking_id || !row.booking_token) throw new Error("no booking returned");
  return { id: String(row.booking_id), token: String(row.booking_token) };
}

export async function submitPaymentReference(id: string, token: string, reference: string) {
  const { data, error } = await publicBackend().rpc("submit_physio_payment_reference", { p_booking_id: id, p_booking_token: token, p_payment_reference: reference });
  if (error) throw error;
  if (data === false) throw Object.assign(new Error("permission"), { code: "42501" });
}

/** True only when the signed-in user has an admin_users membership row. Throws on network/backend errors so callers don't mislabel them as "not authorised". */
export async function isStaff(userId: string): Promise<boolean> {
  const { data, error } = await backend().from("admin_users").select("user_id").eq("user_id", userId).limit(1);
  if (error) {
    if (error.code === "42501") return false;
    throw error;
  }
  return (data ?? []).length === 1;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await backend().from("bookings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function updateBookingStatus(id: Booking["id"], status: BookingStatus) {
  const { data, error } = await backend().from("bookings").update({ status }).eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw Object.assign(new Error("permission"), { code: "42501" });
}

export async function savePrices(rows: PriceRow[]) {
  for (const r of rows) {
    const { data, error } = await backend().from("service_prices").update({ price: r.price }).eq("service", r.service).select("service");
    if (error) throw error;
    if (!data || data.length === 0) throw Object.assign(new Error("permission"), { code: "42501" });
  }
}

/** Token-only lookup; returns no patient contact details. null = no booking for that code. */
export async function getBookingStatus(token: string): Promise<PublicStatus | null> {
  const { data, error } = await publicBackend().rpc("get_physio_booking_status", { p_booking_token: token });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as PublicStatus | undefined;
  return row ? { ...row, amount: Number(row.amount) } : null;
}

/** Staff only (RLS): record that the clinic has agreed the appointment with the patient. */
export async function confirmAppointment(id: Booking["id"]): Promise<string> {
  const at = new Date().toISOString();
  const { data, error } = await backend().from("bookings").update({ appointment_confirmed_at: at }).eq("id", id).eq("status", "completed").select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw Object.assign(new Error("permission"), { code: "42501" });
  return at;
}
