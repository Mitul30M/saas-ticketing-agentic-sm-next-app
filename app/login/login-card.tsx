"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRightIcon, CircleDotIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn, type SignInState } from "@/lib/auth-actions";

const INITIAL: SignInState = { error: null };

export function LoginCard({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-medium">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <CircleDotIcon aria-hidden className="size-4" />
        </span>
        <span>Nimbus agent console</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identify yourself for the audit trail</CardTitle>
          <CardDescription>
            The label is written to every decision you make. It is not a password and is not
            verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <FieldGroup>
              <Field data-invalid={state.error ? true : undefined}>
                <FieldLabel htmlFor="operator-name">Your name</FieldLabel>
                <Input
                  id="operator-name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  required
                  maxLength={100}
                  placeholder="e.g. Mia Chen"
                  aria-invalid={state.error ? true : undefined}
                  aria-describedby="operator-name-description"
                />
                <FieldDescription id="operator-name-description">
                  Use the name a reviewer would recognise in the approval history.
                </FieldDescription>
              </Field>
            </FieldGroup>

            {state.error && (
              <Alert variant="destructive">
                <AlertTitle>Check the label</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Enter console
              {!pending && <ArrowRightIcon data-icon="inline-end" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Submitting a request?{" "}
        <Link href="/submit" className="text-foreground underline underline-offset-4">
          Use the customer portal
        </Link>
        .
      </p>
    </div>
  );
}
