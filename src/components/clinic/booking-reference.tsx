import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeStatus, shortReference } from "@/lib/booking-status";

export function BookingReference({
  id,
  token,
  status,
  serviceName,
  amount,
}: {
  id: string;
  token: string;
  status: string;
  serviceName: string;
  amount: number;
}) {
  const [copied, setCopied] = useState(false);
  const info = describeStatus(status);
  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user can select the text */
    }
  }
  return (
    <div className="payment-explanation booking-reference" aria-live="polite">
      <p className="status-pill" data-tone={info.tone}>
        <strong>{info.label}</strong>
      </p>
      <p>{info.message}</p>
      <dl className="reference-list">
        <div>
          <dt>Booking reference</dt>
          <dd>{shortReference(id)}</dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{serviceName}</dd>
        </div>
        <div>
          <dt>Fee</dt>
          <dd>₹{amount}</dd>
        </div>
        <div className="full-field">
          <dt>Status code (keep private)</dt>
          <dd>
            <code className="status-code">{token}</code>
            <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy code"}
            </Button>
          </dd>
        </div>
      </dl>
      <p className="small-note">
        Save this code. You can check your status later on the{" "}
        <Link to="/booking-status">booking status page</Link>. Quote the booking reference when you
        call the clinic. Don't share the status code publicly.
      </p>
    </div>
  );
}
