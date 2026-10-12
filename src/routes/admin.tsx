import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  CreditCard,
  ArrowLeft,
  Search,
  Info,
  Clock,
  Check,
  X,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/clinic/site-layout";
import { demoBookings } from "@/lib/clinic-data";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin demo | Dr. Agrawal’s Physiotherapy Centre" },
      {
        name: "description",
        content:
          "Design-only booking administration and manual payment review. All records are fictional demo data.",
      },
      { property: "og:title", content: "Clinic administration | Design preview" },
      {
        property: "og:description",
        content:
          "Fictional booking records and payment verification concepts. No live patient data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});
function Admin() {
  const [rows, setRows] = useState(demoBookings);
  const [tab, setTab] = useState("Bookings");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const record = rows.find((r) => r.id === selected);
  const shown = rows.filter(
    (r) =>
      (tab !== "Payment review" || r.payment === "Awaiting verification") &&
      (filter === "All statuses" || r.status === filter) &&
      `${r.name} ${r.service} ${r.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pending = rows.filter((r) => r.payment === "Awaiting verification").length;
  function open(id: string) {
    setSelected(id);
    dialog.current?.showModal();
  }
  function update(action: "verify" | "reject" | "cancel") {
    if (!record) return;
    setRows((old) =>
      old.map((r) =>
        r.id === record.id
          ? {
              ...r,
              payment:
                action === "verify"
                  ? "Verified"
                  : action === "reject"
                    ? "Needs clarification"
                    : r.payment,
              status:
                action === "verify" ? "Confirmed" : action === "cancel" ? "Cancelled" : "Pending",
            }
          : r,
      ),
    );
    setMessage(
      `${record.id}: demo ${action === "verify" ? "payment verified and appointment confirmed" : action === "reject" ? "payment flagged for clarification" : "appointment cancelled"}. No real record was changed.`,
    );
    dialog.current?.close();
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <span className="demo-label">Admin · design preview</span>
        <nav aria-label="Admin navigation">
          {[
            ["Overview", LayoutDashboard],
            ["Bookings", CalendarDays],
            ["Payment review", CreditCard],
          ].map(([text, Icon]) => {
            const I = Icon as typeof CalendarDays;
            return (
              <Button
                key={String(text)}
                variant="ghost"
                className={tab === text ? "active" : ""}
                aria-pressed={tab === text}
                onClick={() => {
                  setTab(String(text));
                  setFilter("All statuses");
                }}
              >
                <I />
                {String(text)}
              </Button>
            );
          })}
        </nav>
        <Link className="back-site" to="/">
          <ArrowLeft size={14} /> Back to clinic website
        </Link>
      </aside>
      <main className="admin-content">
        <div className="admin-top">
          <div>
            <span className="eyebrow">Clinic workspace</span>
            <h1>
              {tab === "Payment review"
                ? "Payment review"
                : tab === "Overview"
                  ? "A clear view of your day."
                  : "Appointments"}
            </h1>
            <p>Wednesday, 14 October 2026 · Illustrative clinic schedule</p>
          </div>
          <div className="admin-user">
            <span>DA</span>
            <div>
              Demo admin
              <br />
              <small className="small-note">Preview access</small>
            </div>
          </div>
        </div>
        <div className="demo-notice">
          <Info />
          <span>
            <strong>Demo workspace.</strong> Every patient, booking and transaction is fictional.
            Changes last only while this page is open. No live records or payments are connected.
          </span>
        </div>
        <div className="admin-stats">
          {[
            [
              String(rows.length),
              "Demo appointments",
              CalendarDays,
              "Across the illustrative schedule",
            ],
            [
              String(rows.filter((r) => r.status === "Confirmed").length),
              "Confirmed",
              Check,
              "Demo confirmation status",
            ],
            [String(pending), "Payment to review", CreditCard, "Manual verification queue"],
            [
              String(rows.filter((r) => r.status === "Pending").length),
              "Awaiting confirmation",
              Clock,
              "Availability or payment review",
            ],
          ].map(([value, label, Icon, note]) => {
            const I = Icon as typeof Check;
            return (
              <div className="stat-card" key={String(label)}>
                <div>
                  {String(label)}
                  <I />
                </div>
                <strong>{String(value)}</strong>
                <small>{String(note)}</small>
              </div>
            );
          })}
        </div>
        <section className="admin-table-section">
          <div className="table-toolbar">
            <h2>
              {tab === "Payment review" ? "Transactions awaiting review" : "Booking records"}{" "}
              <span className="small-note">({shown.length})</span>
            </h2>
            <div className="table-controls">
              <label className="search-box">
                <Search />
                <input
                  className="form-control"
                  aria-label="Search demo bookings"
                  placeholder="Search bookings"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                className="form-control"
                aria-label="Filter booking status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {["All statuses", "Pending", "Confirmed", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Patient / Booking</th>
                  <th>Service</th>
                  <th>Date & time</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      <small>{r.id}</small>
                    </td>
                    <td>{r.service}</td>
                    <td>
                      {r.date}
                      <small>{r.time} IST</small>
                    </td>
                    <td>
                      ₹{r.amount.toLocaleString("en-IN")}
                      <small>Demo fee</small>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${r.status === "Pending" ? "pending" : r.status === "Confirmed" ? "confirmed" : ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${r.payment === "Awaiting verification" ? "pending" : r.payment === "Verified" ? "confirmed" : ""}`}
                      >
                        {r.payment}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => open(r.id)}
                        aria-label={`Review ${r.id}`}
                      >
                        Review <ArrowUpRight />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!shown.length && (
              <div className="empty-state">No demo bookings match your filters.</div>
            )}
          </div>
          <div className="table-footer">
            Showing {shown.length} fictional records · Pricing and transactions are illustrative
          </div>
        </section>
        {message && (
          <p className="admin-message" role="status">
            {message}
          </p>
        )}
        <div className="admin-review">
          <ShieldCheck />
          <div>
            <h3>A transaction reference is not proof of payment.</h3>
            <p>
              In the live workflow, match the reference, amount and recipient against the clinic’s
              payment records before confirming. This preview cannot perform that check.
            </p>
          </div>
        </div>
      </main>
      <dialog className="review-dialog" aria-labelledby="booking-review-title" ref={dialog} onClose={() => setSelected(null)}>
        <div className="dialog-heading">
          <h2 id="booking-review-title">Booking review</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close booking review"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </Button>
        </div>
        {record && (
          <>
            <div className="demo-notice">
              <Info />
              <span>
                Fictional record only. Review actions simulate status changes; they do not verify
                any real payment.
              </span>
            </div>
            {[
              ["Booking", record.id],
              ["Patient", record.name],
              ["Service", record.service],
              ["Appointment", `${record.date} · ${record.time}`],
              ["Amount", `₹${record.amount} · demo fee`],
              ["UPI reference", record.reference],
              ["Payment", record.payment],
              ["Booking status", record.status],
            ].map(([label, value]) => (
              <div className="summary-line" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
            <p className="small-note">
              No real contact details or medical information are present.
            </p>
            <div className="dialog-actions">
              {record.payment === "Awaiting verification" ? (
                <>
                  <Button variant="outline" onClick={() => update("reject")}>
                    Needs clarification
                  </Button>
                  <Button onClick={() => update("verify")}>
                    <Check /> Verify demo payment
                  </Button>
                </>
              ) : record.status !== "Cancelled" ? (
                <Button variant="outline" onClick={() => update("cancel")}>
                  Cancel demo booking
                </Button>
              ) : (
                <Button variant="outline" onClick={() => dialog.current?.close()}>
                  Close review
                </Button>
              )}
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
