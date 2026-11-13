"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OPERATOR_COOKIE, safeNextPath, validateOperatorName } from "@/lib/operator";

export interface SignInState {
  error: string | null;
}

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const validation = validateOperatorName(formData.get("name"));
  if (!validation.ok || !validation.name) {
    return { error: validation.error ?? "Enter your name." };
  }

  const store = await cookies();
  store.set(OPERATOR_COOKIE, validation.name, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(safeNextPath(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(OPERATOR_COOKIE);
  redirect("/login");
}
