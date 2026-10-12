// Patient- and staff-facing wording for booking states. Never implies a scheduled slot.
export type StatusInfo = {
  label: string;
  message: string;
  tone: "waiting" | "review" | "done" | "stopped";
};

export function describeStatus(status: string, appointmentConfirmed = false): StatusInfo {
  if (status === "cancelled")
    return {
      label: "Cancelled",
      tone: "stopped",
      message:
        "This booking request was cancelled by the clinic. Please call the clinic if you have questions.",
    };
  if (status === "completed" && appointmentConfirmed)
    return {
      label: "Appointment confirmed",
      tone: "done",
      message:
        "Payment verified and the clinic has confirmed your appointment with you. Contact the clinic if you need to change it.",
    };
  if (status === "completed")
    return {
      label: "Payment verified",
      tone: "done",
      message:
        "Payment verified by clinic staff — appointment still pending clinic confirmation. The clinic will contact you to agree a date and time.",
    };
  if (status === "pending_verification")
    return {
      label: "Payment submitted for verification",
      tone: "review",
      message:
        "Payment submitted for verification — appointment still pending clinic confirmation.",
    };
  if (status === "pending")
    return {
      label: "Request received",
      tone: "waiting",
      message:
        "Request received — appointment not confirmed yet. Pay by UPI and submit your reference; the clinic will contact you to agree a date and time.",
    };
  return {
    label: "Status unavailable",
    tone: "waiting",
    message: "Please call the clinic for an update on this booking.",
  };
}

/** Short human reference for phone calls; not used for lookup. */
export function shortReference(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}
