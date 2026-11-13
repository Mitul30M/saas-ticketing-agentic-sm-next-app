import "server-only";

import { cookies } from "next/headers";
import { OPERATOR_COOKIE } from "@/lib/operator";

export async function getOperator(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(OPERATOR_COOKIE)?.value;
  return value && value.trim().length > 0 ? value : null;
}
