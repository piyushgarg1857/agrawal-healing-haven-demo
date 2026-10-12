// Pure, browser-safe validation shared by the booking form and tests.
export function validatePatient(name: string, email: string, phone: string): string | null {
  if (name.trim().length < 2) return "Please enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address.";
  const digits = phone.replace(/\D/g, "");
  if (!/^[+\d][\d\s-]{7,16}$/.test(phone.trim()) || digits.length < 8 || digits.length > 13)
    return "Please enter a valid phone number.";
  return null;
}

export function validateReference(ref: string): string | null {
  return /^[A-Za-z0-9]{6,40}$/.test(ref.trim())
    ? null
    : "Enter the UPI transaction reference (letters and numbers, 6–40 characters).";
}

export function validateFee(value: string): boolean {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n > 0 && n <= 100000;
}

export type SavedBooking = { id: string; token: string; serviceId: string; amount: number };
export function parseSavedBooking(raw: string | null): SavedBooking | null {
  if (!raw) return null;
  try {
    const b = JSON.parse(raw) as Partial<SavedBooking>;
    if (
      typeof b.id === "string" &&
      typeof b.token === "string" &&
      typeof b.serviceId === "string" &&
      typeof b.amount === "number"
    )
      return b as SavedBooking;
  } catch {
    /* ignore malformed */
  }
  return null;
}
