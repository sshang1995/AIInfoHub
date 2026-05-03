import "server-only";
import { Resend } from "resend";

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "newsletter@localhost";

// Lazy singleton — validated at call time, not at module load (avoids build-time errors)
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Re-export for convenience; callers use getResend() when sending
export { Resend };
