import { cookies } from "next/headers";
import { OPERATOR_COOKIE } from "@/lib/operator";
import { isConsolePathAllowed } from "@/lib/proxy-allowlist";
import { errorFromUnknown, errorResponse, forward } from "@/lib/route-proxy";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser callers and same-origin navigations
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function handle(
  request: Request,
  context: RouteContext<"/api/console/[...path]">
): Promise<Response> {
  const { path } = await context.params;
  const method = request.method.toUpperCase();

  // The allow-list is the trust boundary: no admin/*, no unlisted writes.
  if (!isConsolePathAllowed(path, method)) {
    return errorResponse(404, "not found");
  }

  if (method === "POST" && !sameOrigin(request)) {
    return errorResponse(403, "cross-origin request rejected");
  }

  const store = await cookies();
  const operator = store.get(OPERATOR_COOKIE)?.value;
  if (!operator) {
    return errorResponse(401, "operator session required");
  }

  const headerKey = request.headers.get("idempotency-key")?.trim();
  const idempotencyKey = headerKey || (method === "POST" ? crypto.randomUUID() : undefined);

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);

  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();
  const search = new URL(request.url).search;
  const encodedPath = path.map(encodeURIComponent).join("/");

  try {
    return await forward(`/api/${encodedPath}${search}`, {
      method,
      headers,
      body,
      operator,
    });
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/console/[...path]">
) {
  return handle(request, context);
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/console/[...path]">
) {
  return handle(request, context);
}
