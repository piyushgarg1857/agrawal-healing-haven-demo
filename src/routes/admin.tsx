import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter, PageIntro } from "@/components/clinic/site-layout";
import { services } from "@/lib/clinic-data";
import { validateFee } from "@/lib/booking-validation";
import {
  backend,
  confirmAppointment,
  friendlyError,
  getAllBookings,
  getPrices,
  isStaff,
  savePrices,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from "@/lib/physio-backend";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Dr. Agrawal’s Physiotherapy Centre" },
      {
        name: "description",
        content: "Secure clinic administration for bookings, manual UPI verification and fees.",
      },
      { property: "og:title", content: "Admin | Dr. Agrawal’s" },
      { property: "og:description", content: "Clinic administration requires secure sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

const staffLabel = (r: Booking) =>
  r.status === "pending"
    ? "Awaiting payment reference"
    : r.status === "pending_verification"
      ? "Needs payment verification"
      : r.status === "completed"
        ? r.appointment_confirmed_at
          ? "Appointment confirmed"
          : "Payment verified — appointment not confirmed"
        : r.status === "cancelled"
          ? "Cancelled"
          : r.status;

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sb = backend();
    sb.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setReady(true);
      })
      .catch(() => setReady(true));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <>
      <SiteHeader />
      <PageIntro
        eyebrow="Clinic administration"
        title="Admin"
        description="Bookings, manual UPI verification and service fees."
      />
      <main id="main-content" tabIndex={-1} className="container section">
        {!ready ? (
          <p>
            <Loader2 className="inline animate-spin" /> Loading…
          </p>
        ) : session ? (
          <Dashboard email={session.user.email ?? ""} userId={session.user.id} />
        ) : (
          <Login />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Login() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const { error } = await backend().auth.signInWithPassword({
        email: String(f.get("email")),
        password: String(f.get("password")),
      });
      if (error) throw error;
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="booking-step admin-login" onSubmit={onSubmit}>
      <h2>Staff sign-in</h2>
      <div className="form-grid">
        <label className="full-field">
          <span className="field-label">Email</span>
          <input
            className="form-control"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </label>
        <label className="full-field">
          <span className="field-label">Password</span>
          <input
            className="form-control"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Loader2 className="animate-spin" />} Sign in
      </Button>
    </form>
  );
}

function Dashboard({ email, userId }: { email: string; userId: string }) {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<Booking["id"] | null>(null);

  const [staff, setStaff] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [savingFees, setSavingFees] = useState(false);
  const checkAccess = useCallback(() => {
    setAccessError(null);
    setStaff(null);
    isStaff(userId)
      .then(setStaff)
      .catch((err) => setAccessError(friendlyError(err)));
  }, [userId]);
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);
  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, p] = await Promise.all([getAllBookings(), getPrices()]);
      setRows(b);
      const map: Record<string, string> = {};
      services.forEach((s) => {
        map[s.id] = String(p.find((r) => r.service === s.id)?.price ?? s.price);
      });
      setPrices(map);
    } catch (err) {
      setRows([]);
      setError(friendlyError(err));
    }
  }, []);
  useEffect(() => {
    if (staff) void load();
  }, [load, staff]);

  async function setStatus(id: Booking["id"], status: BookingStatus) {
    setBusyId(id);
    setNotice(null);
    setError(null);
    try {
      await updateBookingStatus(id, status);
      setRows((r) => (r ?? []).map((x) => (x.id === id ? { ...x, status } : x)));
      setNotice("Status updated.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyId(null);
    }
  }
  async function onConfirm(id: Booking["id"]) {
    setBusyId(id);
    setNotice(null);
    setError(null);
    try {
      const at = await confirmAppointment(id);
      setRows((r) =>
        (r ?? []).map((x) => (x.id === id ? { ...x, appointment_confirmed_at: at } : x)),
      );
      setNotice("Appointment marked as confirmed.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyId(null);
    }
  }
  async function onSavePrices(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    const list = services.map((s) => ({ service: s.id, price: Number(prices[s.id]) }));
    if (services.some((s) => !validateFee(prices[s.id] ?? ""))) {
      setError("Each fee must be a whole number of rupees between 1 and 100000.");
      return;
    }
    setSavingFees(true);
    try {
      await savePrices(list);
      setNotice("Fees saved.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingFees(false);
    }
  }

  if (accessError)
    return (
      <div className="booking-step">
        <h2>Could not check access</h2>
        <p role="alert" className="form-error">
          {accessError}
        </p>
        <div className="hero-actions">
          <Button onClick={checkAccess}>
            <RefreshCw /> Try again
          </Button>
          <Button variant="outline" onClick={() => void backend().auth.signOut()}>
            <LogOut /> Sign out
          </Button>
        </div>
      </div>
    );
  if (staff === null)
    return (
      <p>
        <Loader2 className="inline animate-spin" /> Checking access…
      </p>
    );
  if (!staff)
    return (
      <div className="booking-step">
        <h2>Not authorised</h2>
        <p>
          Permission denied: this account is not on the clinic staff list. No patient records are
          shown.
        </p>
        <Button variant="outline" onClick={() => void backend().auth.signOut()}>
          <LogOut /> Sign out
        </Button>
      </div>
    );
  return (
    <div className="admin-dashboard">
      <div className="hero-actions">
        <span className="small-note">Signed in as {email}</span>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw /> Refresh
        </Button>
        <Button variant="outline" onClick={() => void backend().auth.signOut()}>
          <LogOut /> Sign out
        </Button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <h2>Bookings</h2>
      <p className="small-note">
        Check each UPI reference in the clinic’s bank/UPI app before marking it verified. Nothing is
        verified automatically. Use “Appointment agreed” only after you have agreed a date and time
        with the patient by phone.
      </p>
      {rows === null ? (
        <p>
          <Loader2 className="inline animate-spin" /> Loading bookings…
        </p>
      ) : rows.length === 0 ? (
        <p>No bookings to show.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Amount</th>
                <th>UPI reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)}>
                  <td>{new Date(r.created_at).toLocaleString("en-IN")}</td>
                  <td>
                    {r.patient_name}
                    <br />
                    <a href={`tel:${r.patient_phone}`}>{r.patient_phone}</a>
                    <br />
                    <a href={`mailto:${r.patient_email}`}>{r.patient_email}</a>
                  </td>
                  <td>{services.find((s) => s.id === r.service)?.name ?? r.service}</td>
                  <td>₹{r.amount}</td>
                  <td>{r.payment_id ?? "—"}</td>
                  <td>{staffLabel(r)}</td>
                  <td>
                    {(r.status === "pending" || r.status === "pending_verification") && (
                      <div className="hero-actions">
                        {r.status === "pending_verification" && (
                          <Button
                            size="sm"
                            disabled={busyId === r.id}
                            onClick={() => void setStatus(r.id, "completed")}
                          >
                            Mark verified
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === r.id}
                          onClick={() => void setStatus(r.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {r.status === "completed" && !r.appointment_confirmed_at && (
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        onClick={() => void onConfirm(r.id)}
                      >
                        Appointment agreed
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form onSubmit={onSavePrices}>
        <h2>Service fees (₹)</h2>
        <div className="form-grid">
          {services.map((s) => (
            <label key={s.id}>
              <span className="field-label">{s.name}</span>
              <input
                className="form-control"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={prices[s.id] ?? ""}
                onChange={(e) => setPrices((p) => ({ ...p, [s.id]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <Button type="submit" disabled={savingFees}>
          {savingFees && <Loader2 className="animate-spin" />} Save fees
        </Button>
      </form>
    </div>
  );
}
