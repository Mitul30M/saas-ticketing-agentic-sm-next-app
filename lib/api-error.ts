import type { ValidationError } from "@/lib/api-types";

export type ApiErrorDetail = string | ValidationError[];

export interface ApiFailure {
  status: number;
  detail: ApiErrorDetail;
  message: string;
}

/** Pulls the backend's `detail` out of any error body shape. */
export function normalizeDetail(body: unknown): ApiErrorDetail {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail as ValidationError[];
  }
  return "Request failed";
}

/** One human sentence for an error payload; validation arrays are flattened. */
export function detailMessage(detail: ApiErrorDetail | unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : ""))
      .filter(Boolean);
    return messages.length > 0 ? messages.join("; ") : "Validation failed";
  }
  return "Request failed";
}

/** `loc` is ["body", "subject"]; the last string segment is the field name. */
export function fieldErrorsFromDetail(detail: ApiErrorDetail): Record<string, string> {
  if (!Array.isArray(detail)) return {};
  const fields: Record<string, string> = {};
  for (const item of detail) {
    const loc = Array.isArray(item.loc) ? item.loc : [];
    const field = [...loc].reverse().find((part): part is string => typeof part === "string");
    if (field && !fields[field]) fields[field] = item.msg;
  }
  return fields;
}

/**
 * Client-side reader for the console/submit routes. The proxy passes the
 * backend status and body through unchanged, so this is the only parser the
 * browser needs.
 */
export async function readApiFailure(response: Response): Promise<ApiFailure> {
  const body: unknown = await response.json().catch(() => null);
  const detail = normalizeDetail(body);
  return { status: response.status, detail, message: detailMessage(detail) };
}
