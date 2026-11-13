import type { ApprovalKind } from "@/lib/api-types";

const APPROVAL_KINDS: ReadonlySet<string> = new Set<ApprovalKind>([
  "refund",
  "plan_change",
  "send_reply",
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The console proxy's allow-list. This is a pure function so it can be tested
 * without booting Next, and it is the only gate that decides whether a browser
 * request may reach the backend with the shared token.
 *
 * Deliberately absent: every `admin/*` path, writes other than run/decide, and
 * anything with a trailing nested segment we did not enumerate.
 */
export function isConsolePathAllowed(path: readonly string[], method: string): boolean {
  const parts = [...path];
  if (parts.length === 0) return false;
  if (parts.some((part) => part.length === 0 || part === ".." || part === ".")) return false;
  if (parts[0].toLowerCase() === "admin") return false;

  const verb = method.toUpperCase();

  // tickets, tickets/:id, tickets/:id/trace, tickets/:id/run
  if (parts[0] === "tickets") {
    if (parts.length === 1) return verb === "GET";
    if (!UUID.test(parts[1])) return false;
    if (parts.length === 2) return verb === "GET";
    if (parts.length === 3) {
      if (parts[2] === "trace") return verb === "GET";
      if (parts[2] === "run") return verb === "POST";
    }
    return false;
  }

  // approvals/pending, approvals/:kind/:ref/decide
  if (parts[0] === "approvals") {
    if (parts.length === 2 && parts[1] === "pending") return verb === "GET";
    if (parts.length === 4 && parts[3] === "decide") {
      return verb === "POST" && APPROVAL_KINDS.has(parts[1]) && UUID.test(parts[2]);
    }
    return false;
  }

  // customers/:id
  if (parts[0] === "customers") {
    return parts.length === 2 && UUID.test(parts[1]) && verb === "GET";
  }

  // kb/articles, kb/articles/:id, kb/search
  if (parts[0] === "kb") {
    if (parts[1] === "articles") {
      if (parts.length === 2) return verb === "GET";
      if (parts.length === 3) return verb === "GET" && /^KB-\d+$/i.test(parts[2]);
    }
    if (parts[1] === "search" && parts.length === 2) return verb === "GET";
    return false;
  }

  // metrics/summary
  if (parts[0] === "metrics" && parts.length === 2 && parts[1] === "summary") {
    return verb === "GET";
  }

  return false;
}
