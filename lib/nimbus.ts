import "server-only";

import type {
  CreateTicketRequest,
  CreateTicketResponse,
  Customer,
  DecideRequest,
  DecideResponse,
  HealthResponse,
  KbArticle,
  KbArticlesResponse,
  KbSearchResponse,
  MetricsSummary,
  PendingApprovalsResponse,
  RerunResponse,
  TicketDetail,
  TicketListResponse,
  TraceResponse,
  ValidationError,
} from "@/lib/api-types";
import { normalizeDetail, type ApiErrorDetail } from "@/lib/api-error";

const DEFAULT_BASE_URL = "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: ApiErrorDetail;

  constructor(status: number, detail: ApiErrorDetail) {
    super(typeof detail === "string" ? detail : `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function baseUrl(): string {
  return (process.env.NIMBUS_API_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function token(): string | null {
  const value = process.env.AGENT_TOKEN;
  return value && value.trim().length > 0 ? value : null;
}

export interface BackendConfig {
  baseUrl: string;
  host: string;
  tokenConfigured: boolean;
}

/** Server-side facts for the settings page. Never includes the token itself. */
export function backendConfig(): BackendConfig {
  const url = baseUrl();
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    // Keep the raw string so a misconfigured URL is still visible.
  }
  return { baseUrl: url, host, tokenConfigured: token() !== null };
}

async function readError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  return new ApiError(response.status, normalizeDetail(body));
}

interface ServerRequestInit extends RequestInit {
  /** Audit label for decision calls. Never authentication. */
  operator?: string;
  /** Public endpoints (healthz, ticket intake) skip the bearer token. */
  anonymous?: boolean;
}

/**
 * Server-side passthrough used by the route handlers. Returns the backend
 * Response unchanged so status codes, Retry-After and error bodies survive.
 * The bearer token is injected here and never leaves the server.
 */
export async function backendFetch(path: string, init: ServerRequestInit = {}): Promise<Response> {
  const { operator, anonymous, headers, ...rest } = init;
  const authToken = token();

  if (!anonymous && !authToken) {
    throw new ApiError(503, "backend authentication is not configured");
  }

  const requestHeaders = new Headers(headers);
  if (!anonymous && authToken) requestHeaders.set("Authorization", `Bearer ${authToken}`);
  if (operator) requestHeaders.set("X-Operator", operator);
  if (rest.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    return await fetch(`${baseUrl()}${path}`, {
      ...rest,
      headers: requestHeaders,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "the backend is unreachable");
  }
}

async function request<T>(path: string, init: ServerRequestInit = {}): Promise<T> {
  const response = await backendFetch(path, init);
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json().catch(() => null)) as T;
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export const api = {
  health: () => request<HealthResponse>("/healthz", { anonymous: true }),

  listTickets: (params: {
    status?: string;
    queue?: string;
    escalated?: boolean;
    handled_by?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => request<TicketListResponse>(`/api/tickets${query(params)}`),

  ticket: (id: string) => request<TicketDetail>(`/api/tickets/${id}`),

  trace: (id: string) => request<TraceResponse>(`/api/tickets/${id}/trace`),

  pending: () => request<PendingApprovalsResponse>("/api/approvals/pending"),

  customer: (id: string) => request<Customer>(`/api/customers/${id}`),

  kbArticles: (limit = 50) => request<KbArticlesResponse>(`/api/kb/articles${query({ limit })}`),

  kbArticle: (id: string) => request<KbArticle>(`/api/kb/articles/${encodeURIComponent(id)}`),

  kbSearch: (q: string) => request<KbSearchResponse>(`/api/kb/search${query({ q })}`),

  metrics: () => request<MetricsSummary>("/api/metrics/summary"),

  // The only public write. Callable from the submit route handler only.
  createTicket: (payload: CreateTicketRequest, idempotencyKey: string) =>
    request<CreateTicketResponse>("/api/tickets", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
      anonymous: true,
    }),

  runTicket: (id: string, idempotencyKey: string) =>
    request<RerunResponse>(`/api/tickets/${id}/run`, {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
    }),

  decide: (
    kind: string,
    ref: string,
    payload: DecideRequest,
    operator: string,
    idempotencyKey: string
  ) =>
    request<DecideResponse>(`/api/approvals/${kind}/${ref}/decide`, {
      method: "POST",
      operator,
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    }),
};

export type { ValidationError };
