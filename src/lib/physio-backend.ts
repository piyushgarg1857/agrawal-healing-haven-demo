// Client for the EXISTING PHYSIO backend (public anon key from PHYSIO/supabase-config.js).
// RLS on the hosted project is the security boundary. Never log patient fields.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env["VITE_PHYSIO_SUPABASE_URL"] ?? "https://nohpalyybvjmbryimrrt.supabase.co";
const ANON_KEY =
  import.meta.env["VITE_PHYSIO_SUPABASE_ANON_KEY"] ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaHBhbHl5YnZqbWJyeWltcnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODU4ODEsImV4cCI6MjA4MDc2MTg4MX0.zoaaY1qLQ6brdHx-hK5B9alDa721Hpk3yYPLqtCxOBQ";

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

/** Human-readable error; never echoes patient data. */
export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
  if (/fetch|network|Failed to fetch|resolve/i.test(msg)) return "The clinic system could not be reached. Please call the clinic or try again later.";
  if (code === "42501" || /permission|row-level security|policy/i.test(msg)) return "This action is not permitted by the clinic system's security settings.";
  if (/Invalid login/i.test(msg)) return "Email or password is incorrect.";
  return "Something went wrong. Please try again or contact the clinic.";
}

export async function getPrices(): Promise<PriceRow[]> {
  const { data, error } = await backend().from("service_prices").select("service, price");
  if (error) throw error;
  return (data ?? []) as PriceRow[];
}

export async function saveBooking(input: { patient_name: string; patient_email: string; patient_phone: string; service: string; amount: number }) {
  const { data, error } = await backend().from("bookings")
    .insert([{ ...input, status: "pending", payment_id: null }]).select("id").single();
  if (error) throw error;
  return data as { id: Booking["id"] };
}

export async function submitPaymentReference(id: Booking["id"], reference: string) {
  const { error } = await backend().from("bookings")
    .update({ payment_id: reference, status: "pending_verification" }).eq("id", id).eq("status", "pending");
  if (error) throw error;
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
  const { error } = await backend().from("service_prices").upsert(rows, { onConflict: "service" });
  if (error) throw error;
}
