"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertCircleIcon, SendIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { count } from "@/lib/format";
import { fieldErrorsFromDetail, readApiFailure } from "@/lib/api-error";
import type { CreateTicketResponse } from "@/lib/api-types";
import {
  BODY_LIMIT,
  SUBJECT_LIMIT,
  validateSubmit,
  type SubmitField,
  type SubmitValues,
} from "@/lib/submit-validation";
import { SubmitSuccess } from "./submit-success";

type Result = { kind: "idle" } | { kind: "success"; ticketId: string; duplicate: boolean };

const EMPTY: SubmitValues = { from_name: "", from_email: "", subject: "", body: "" };

export function SubmitForm() {
  const [values, setValues] = useState<SubmitValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<SubmitField, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>({ kind: "idle" });

  // One key per user intent. Reused on the 409 retry; cleared when the message
  // changes so a later submit is a genuinely new request.
  const idempotencyKey = useRef<string | null>(null);

  function update(field: SubmitField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setGeneralError(null);
    idempotencyKey.current = null;
  }

  async function post(key: string): Promise<Response> {
    return fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify({
        subject: values.subject.trim(),
        body: values.body.trim(),
        from_email: values.from_email.trim(),
        from_name: values.from_name.trim() || null,
      }),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validateSubmit(values);
    setErrors(nextErrors);
    setGeneralError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const key = idempotencyKey.current ?? crypto.randomUUID();
    idempotencyKey.current = key;
    setPending(true);

    try {
      let response = await post(key);

      // 409 + Retry-After means the first call is still in flight. Retry once
      // with the same key: the backend replays the result instead of doubling it.
      if (response.status === 409) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        const delay = Number.isFinite(retryAfter) ? Math.min(Math.max(retryAfter, 0), 5) : 1;
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        response = await post(key);
      }

      if (response.ok) {
        const data = (await response.json()) as CreateTicketResponse;
        setResult({ kind: "success", ticketId: data.ticket_id, duplicate: data.duplicate });
        return;
      }

      const failure = await readApiFailure(response);
      if (failure.status === 422) {
        const fields = fieldErrorsFromDetail(failure.detail);
        if (Object.keys(fields).length > 0) {
          setErrors(fields);
          return;
        }
        setGeneralError(failure.message);
        return;
      }

      if (failure.status === 413) {
        setErrors({ body: "That message is too long. Use 10,000 characters or fewer." });
        return;
      }

      if (failure.status === 409) {
        setGeneralError("A previous attempt is still in progress. Wait a moment and try again.");
        return;
      }

      setGeneralError(
        failure.status === 503
          ? "The support service is unavailable right now. Your message was not sent."
          : failure.message
      );
    } catch {
      setGeneralError("We couldn't reach the support service. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (result.kind === "success") {
    return (
      <SubmitSuccess
        ticketId={result.ticketId}
        duplicate={result.duplicate}
        onReset={() => {
          setValues(EMPTY);
          setErrors({});
          setGeneralError(null);
          idempotencyKey.current = null;
          setResult({ kind: "idle" });
        }}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Tell us what you need</CardTitle>
        <CardDescription>
          A support agent reads every message. Nothing is sent or changed automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {generalError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>We couldn&apos;t submit that</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={errors.from_email ? true : undefined}>
              <FieldLabel htmlFor="from_email">Email</FieldLabel>
              <Input
                id="from_email"
                name="from_email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={320}
                value={values.from_email}
                onChange={(event) => update("from_email", event.target.value)}
                aria-invalid={errors.from_email ? true : undefined}
                aria-describedby="from_email-help"
                placeholder="you@company.com"
              />
              <FieldDescription id="from_email-help">
                We use this to find your account and reply.
              </FieldDescription>
              <FieldError>{errors.from_email}</FieldError>
            </Field>

            <Field data-invalid={errors.from_name ? true : undefined}>
              <FieldLabel htmlFor="from_name">Name (optional)</FieldLabel>
              <Input
                id="from_name"
                name="from_name"
                autoComplete="name"
                maxLength={200}
                value={values.from_name}
                onChange={(event) => update("from_name", event.target.value)}
                aria-invalid={errors.from_name ? true : undefined}
                placeholder="Aaron Martinez"
              />
              <FieldError>{errors.from_name}</FieldError>
            </Field>

            <Field data-invalid={errors.subject ? true : undefined}>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input
                id="subject"
                name="subject"
                maxLength={200}
                value={values.subject}
                onChange={(event) => update("subject", event.target.value)}
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby="subject-help"
                placeholder="Refund policy question"
              />
              <FieldDescription id="subject-help">
                {count(values.subject.length)} / {SUBJECT_LIMIT} characters
              </FieldDescription>
              <FieldError>{errors.subject}</FieldError>
            </Field>

            <Field data-invalid={errors.body ? true : undefined}>
              <FieldLabel htmlFor="body">Message</FieldLabel>
              <Textarea
                id="body"
                name="body"
                rows={8}
                maxLength={BODY_LIMIT}
                value={values.body}
                onChange={(event) => update("body", event.target.value)}
                aria-invalid={errors.body ? true : undefined}
                aria-describedby="body-help"
                placeholder="Describe what happened, and include any invoice or account detail that helps."
                className="min-h-40 resize-y"
              />
              <FieldDescription id="body-help">
                Plain text, {count(values.body.length)} / {count(BODY_LIMIT)} characters.
              </FieldDescription>
              <FieldError>{errors.body}</FieldError>
            </Field>
          </FieldGroup>

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              We reply by email. Sensitive actions always need a human approval.
            </p>
            <Button type="submit" disabled={pending} className="sm:w-auto">
              {pending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
              {pending ? "Sending" : "Send request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
