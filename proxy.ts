import { NextResponse, type NextRequest } from "next/server";
import { OPERATOR_COOKIE } from "@/lib/operator";

/**
 * Auth guard: presence of the audit-label cookie only. This is not
 * authentication and the UI must not present it as one.
 */
export function proxy(request: NextRequest) {
  const operator = request.cookies.get(OPERATOR_COOKIE)?.value;
  const { pathname, search } = request.nextUrl;

  if (pathname === "/login") {
    if (operator) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (!operator) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
