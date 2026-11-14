import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginCard } from "./login-card";
import { ModeToggle } from "@/components/mode-toggle";
import { safeNextPath } from "@/lib/operator";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Suspense fallback={<LoginCard next="/dashboard" />}>
        {props.searchParams.then((params) => (
          <LoginCard next={safeNextPath(params.next)} />
        ))}
      </Suspense>
    </main>
  );
}
