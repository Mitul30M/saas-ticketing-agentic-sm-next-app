import { detailMessage, readApiFailure, type ApiErrorDetail, type ApiFailure } from "@/lib/api-error";

/**
 * Browser-side access to the console proxy. Never talks to the backend directly
 * and never sees the agent token: `/api/console/*` adds both on the server.
 */
export class ClientApiError extends Error {
  readonly status: number;
  readonly detail: ApiErrorDetail;

  constructor(status: number, detail: ApiErrorDetail) {
    super(detailMessage(detail));
    this.name = "ClientApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function apiFailure(error: unknown): ApiFailure | null {
  if (error instanceof ClientApiError) {
    return { status: error.status, detail: error.detail, message: error.message };
  }
  return null;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function consolePath(path: string): string {
  return `/api/console/${path.replace(/^\/+/, "")}`;
}

export async function clientGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(consolePath(path), {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const failure = await readApiFailure(response);
    throw new ClientApiError(failure.status, failure.detail);
  }
  return (await response.json()) as T;
}

export async function clientPost<T>(
  path: string,
  body: unknown,
  idempotencyKey: string,
  signal?: AbortSignal
): Promise<T> {
  const hasBody = body !== undefined;
  const response = await fetch(consolePath(path), {
    method: "POST",
    signal,
    cache: "no-store",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      "Idempotency-Key": idempotencyKey,
      Accept: "application/json",
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const failure = await readApiFailure(response);
    throw new ClientApiError(failure.status, failure.detail);
  }
  return (await response.json()) as T;
}
