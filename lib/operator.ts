export const OPERATOR_COOKIE = "nimbus_operator";

export interface OperatorValidation {
  ok: boolean;
  name?: string;
  error?: string;
}

export function operatorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials || "?";
}

/** 1–100 chars, trimmed, single line. The backend caps at 200, we stay stricter. */
export function validateOperatorName(raw: unknown): OperatorValidation {
  if (typeof raw !== "string") return { ok: false, error: "Enter your name." };
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: "Enter your name." };
  if (name.length > 100) return { ok: false, error: "Use 100 characters or fewer." };
  if (/[\r\n]/.test(name)) return { ok: false, error: "Use a single line." };
  return { ok: true, name };
}

/**
 * Only allow returning to a console path after login. Prevents `?next=` from
 * becoming an open redirect.
 */
export function safeNextPath(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) return "/dashboard";
  if (!raw.startsWith("/dashboard")) return "/dashboard";
  if (raw.startsWith("//") || raw.includes("\\") || raw.includes("\n")) return "/dashboard";
  return raw;
}
