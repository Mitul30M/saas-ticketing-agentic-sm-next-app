import { errorFromUnknown, errorResponse, forward } from "@/lib/route-proxy";

/**
 * Public customer intake. This route never reads the operator cookie and never
 * adds the bearer token; the backend's POST /api/tickets is public by design.
 */
export async function POST(request: Request): Promise<Response> {
  const headerKey = request.headers.get("idempotency-key")?.trim();
  const idempotencyKey = headerKey || crypto.randomUUID();

  const body = await request.text();
  if (body.trim().length === 0) {
    return errorResponse(400, "request body is required");
  }

  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") ?? "application/json");
  headers.set("Idempotency-Key", idempotencyKey);

  try {
    return await forward("/api/tickets", {
      method: "POST",
      headers,
      body,
      anonymous: true,
    });
  } catch (error) {
    return errorFromUnknown(error);
  }
}
