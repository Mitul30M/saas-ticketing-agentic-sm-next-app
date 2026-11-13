import { ApiError, backendFetch } from "@/lib/nimbus";
import type { ApiErrorDetail } from "@/lib/api-error";

/**
 * Copies the backend response to the browser. Status and error details are the
 * contract: the client branches on 400/401/404/409/413/422/503.
 */
export function passthrough(response: Response): Response {
  const headers = new Headers();
  headers.set("Content-Type", response.headers.get("content-type") ?? "application/json");
  headers.set("Cache-Control", "no-store");
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) headers.set("Retry-After", retryAfter);

  const body = [204, 205, 304].includes(response.status) ? null : response.body;
  return new Response(body, { status: response.status, headers });
}

export function errorResponse(status: number, detail: ApiErrorDetail): Response {
  return Response.json({ detail }, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorFromUnknown(error: unknown): Response {
  if (error instanceof ApiError) return errorResponse(error.status, error.detail);
  return errorResponse(500, "unexpected proxy error");
}

export async function forward(
  path: string,
  init: RequestInit & { operator?: string; anonymous?: boolean }
): Promise<Response> {
  const response = await backendFetch(path, init);
  return passthrough(response);
}
