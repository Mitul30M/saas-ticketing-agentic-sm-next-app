"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RetryButton({ label = "Try again" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? <Spinner data-icon="inline-start" /> : <RotateCwIcon data-icon="inline-start" />}
      {pending ? "Retrying" : label}
    </Button>
  );
}
