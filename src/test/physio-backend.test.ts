import { beforeEach, describe, expect, it, vi } from "vitest";

const clients: { url: string; opts: { auth?: { persistSession?: boolean } } }[] = [];
const calls: { url?: string; rpc: [string, unknown][]; from: string[] } = { rpc: [], from: [] };
let rpcResult: { data: unknown; error: unknown } = { data: null, error: null };
let tableResult: { data: unknown; error: unknown } = { data: [], error: null };

vi.mock("@supabase/supabase-js", () => ({
  createClient: (url: string, _k: string, opts: { auth?: { persistSession?: boolean } }) => {
    calls.url = url; clients.push({ url, opts });
    const client: Record<string, unknown> = {};
    const q: Record<string, unknown> = {};
    for (const m of ["select", "eq", "limit", "order", "update"]) q[m] = () => q;
    q["then"] = (r: (v: unknown) => unknown) => Promise.resolve(tableResult).then(r);
    Object.assign(client, {
      rpc: (name: string, args: unknown) => { calls.rpc.push([name, args]); return Promise.resolve(rpcResult); },
      from: (t: string) => { calls.from.push(t); return q; },
    });
    return client;
  },
}));

import * as be from "@/lib/physio-backend";
import { parseSavedBooking, validateFee, validatePatient, validateReference } from "@/lib/booking-validation";

beforeEach(() => { calls.rpc = []; calls.from = []; rpcResult = { data: null, error: null }; tableResult = { data: [], error: null }; });

describe("PHYSIO backend", () => {
  it("targets the PHYSIO Supabase project", () => {
    be.backend();
    expect(calls.url).toBe("https://ussqspqymblfruqsedzv.supabase.co");
  });

  it("creates bookings only through the create_physio_booking RPC", async () => {
    rpcResult = { data: [{ booking_id: "b1", booking_token: "t1" }], error: null };
    await expect(be.saveBooking({ patient_name: "A B", patient_email: "a@b.co", patient_phone: "9999999999", service: "sports" })).resolves.toEqual({ id: "b1", token: "t1" });
    expect(calls.rpc[0]?.[0]).toBe("create_physio_booking");
    expect(calls.from).not.toContain("bookings");
  });

  it("rejects a missing booking token instead of faking success", async () => {
    rpcResult = { data: [{ booking_id: "b1" }], error: null };
    await expect(be.saveBooking({ patient_name: "A B", patient_email: "a@b.co", patient_phone: "9999999999", service: "sports" })).rejects.toThrow();
  });

  it("treats a false payment-reference result as denied", async () => {
    rpcResult = { data: false, error: null };
    await expect(be.submitPaymentReference("b1", "bad", "ABC123456")).rejects.toMatchObject({ code: "42501" });
    expect(calls.rpc[0]?.[0]).toBe("submit_physio_payment_reference");
  });

  it("surfaces backend errors from the staff check rather than hiding them", async () => {
    tableResult = { data: null, error: { message: "Failed to fetch" } };
    await expect(be.isStaff("u1")).rejects.toBeTruthy();
    tableResult = { data: [], error: null };
    await expect(be.isStaff("u1")).resolves.toBe(false);
  });

  it("reports a status update that touched no rows as denied", async () => {
    tableResult = { data: [], error: null };
    await expect(be.updateBookingStatus("b1", "completed")).rejects.toMatchObject({ code: "42501" });
  });

  it("maps errors to messages without echoing input", () => {
    expect(be.friendlyError({ message: "Failed to fetch" })).toMatch(/could not be reached/);
    expect(be.friendlyError({ code: "42501", message: "x" })).toMatch(/not permitted/);
    expect(be.friendlyError(new Error("patient a@b.co"))).not.toContain("a@b.co");
  });
});

describe("regression: booking while a staff session exists", () => {
  it("sends booking RPCs through a session-less anon client, not the staff client", async () => {
    be.backend(); // staff client (persists session)
    rpcResult = { data: [{ booking_id: "b1", booking_token: "t1" }], error: null };
    await be.saveBooking({ patient_name: "A B", patient_email: "a@b.co", patient_phone: "9999999999", service: "consultation" });
    expect(be.publicBackend()).not.toBe(be.backend());
    const pub = clients.find(c => c.opts?.auth?.persistSession === false);
    expect(pub?.url).toBe("https://ussqspqymblfruqsedzv.supabase.co");
    expect(calls.rpc[0]).toEqual(["create_physio_booking", { p_patient_name: "A B", p_patient_email: "a@b.co", p_patient_phone: "9999999999", p_service: "consultation" }]);
  });
  it("shows the clinic system's validation message instead of a permission error", () => {
    expect(be.friendlyError({ code: "P0001", message: "Please enter a valid phone number" })).toBe("Please enter a valid phone number.");
    expect(be.friendlyError({ code: "P0001", message: "anything else a@b.co" })).not.toContain("a@b.co");
  });
});

describe("validation", () => {
  it("validates patient details", () => {
    expect(validatePatient("Asha", "asha@example.com", "+91 98765 43210")).toBeNull();
    expect(validatePatient("A", "x", "1")).not.toBeNull();
    expect(validatePatient("Asha", "asha@example.com", "12")).not.toBeNull();
  });
  it("validates UPI references and fees", () => {
    expect(validateReference("ABC123456")).toBeNull();
    expect(validateReference("abc")).not.toBeNull();
    expect(validateFee("500")).toBe(true);
    expect(validateFee("0")).toBe(false);
    expect(validateFee("12.5")).toBe(false);
    expect(validateFee("")).toBe(false);
  });
  it("ignores malformed saved bookings", () => {
    expect(parseSavedBooking("{bad")).toBeNull();
    expect(parseSavedBooking(JSON.stringify({ id: "1", token: "t" }))).toBeNull();
    expect(parseSavedBooking(JSON.stringify({ id: "1", token: "t", serviceId: "sports", amount: 900 }))).not.toBeNull();
  });
});
