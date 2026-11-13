import type { Queue, TicketStatus } from "@/lib/api-types";

export const PAGE_LIMIT = 20;
export const QUERY_LIMIT = 200;

export type TabKey =
  | "all"
  | "awaiting_approval"
  | "needs_human"
  | "triaging"
  | "resolved"
  | "failed";

export interface TabDefinition {
  key: TabKey;
  label: string;
  status?: TicketStatus;
  escalated?: boolean;
}

export const TICKET_TABS: readonly TabDefinition[] = [
  { key: "all", label: "All" },
  { key: "awaiting_approval", label: "Needs approval", status: "awaiting_approval" },
  { key: "needs_human", label: "Needs human", escalated: true },
  { key: "triaging", label: "Triaging", status: "triaging" },
  { key: "resolved", label: "Resolved", status: "resolved" },
  { key: "failed", label: "Failed", status: "failed" },
];

export const QUEUES: readonly Queue[] = [
  "billing",
  "account",
  "technical",
  "security",
  "incidents",
  "product",
  "general",
];

export interface TicketFilters {
  tab: TabKey;
  q: string;
  queue: Queue | null;
  page: number;
  limit: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isTab(value: string | undefined): value is TabKey {
  return TICKET_TABS.some((tab) => tab.key === value);
}

function isQueue(value: string | undefined): value is Queue {
  return value !== undefined && (QUEUES as readonly string[]).includes(value);
}

export function parseTicketFilters(params: SearchParams): TicketFilters {
  const rawTab = first(params.tab);
  const rawPage = Number(first(params.page) ?? "1");
  const page = Number.isFinite(rawPage) ? Math.min(Math.max(Math.trunc(rawPage), 1), 10_000) : 1;
  const rawQueue = first(params.queue);

  return {
    tab: isTab(rawTab) ? rawTab : "all",
    q: (first(params.q) ?? "").trim().slice(0, QUERY_LIMIT),
    queue: isQueue(rawQueue) ? rawQueue : null,
    page,
    limit: PAGE_LIMIT,
  };
}

export function tabDefinition(key: TabKey) {
  return TICKET_TABS.find((tab) => tab.key === key) ?? TICKET_TABS[0];
}

export interface TicketApiParams {
  status?: TicketStatus;
  escalated?: boolean;
  queue?: Queue;
  q?: string;
  page: number;
  limit: number;
}

export function ticketApiParams(filters: TicketFilters): TicketApiParams {
  const tab = tabDefinition(filters.tab);
  return {
    status: tab.status,
    escalated: tab.escalated,
    queue: filters.queue ?? undefined,
    q: filters.q || undefined,
    page: filters.page,
    limit: filters.limit,
  };
}

export function ticketSearch(filters: TicketFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(ticketApiParams(filters))) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function filtersKey(filters: TicketFilters): string {
  return [filters.tab, filters.q, filters.queue ?? "", filters.page].join("|");
}

export function hasActiveFilters(filters: TicketFilters): boolean {
  return filters.tab !== "all" || filters.q.length > 0 || filters.queue !== null;
}
