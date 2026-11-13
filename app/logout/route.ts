import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OPERATOR_COOKIE } from "@/lib/operator";

/** GET is intentional: a link can end the demo session. */
export async function GET(request: Request) {
  const store = await cookies();
  store.delete(OPERATOR_COOKIE);
  return NextResponse.redirect(new URL("/login", request.url));
}
