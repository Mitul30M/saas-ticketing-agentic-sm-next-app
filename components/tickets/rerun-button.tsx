"use client";

import { useState } from "react";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { RerunResponse, TicketStatus } from "@/lib/api-types";
import { apiFailure, clientPost } from "@/lib/client-api";

export function RerunButton({
  ticketId,
  status,
  onRefresh,
}: {
  ticketId: string;
  status: TicketStatus;
  onRefresh: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked =
    status === "new" || status === "triaging"
      ? "The agent is already running on this ticket."
      : status === "awaiting_approval"
        ? "Decide the pending approval before re-running."
        : null;

  async function run() {
    if (pending || blocked) return;
    setPending(true);
    setError(null);
    try {
      await clientPost<RerunResponse>(
        `tickets/${ticketId}/run`,
        undefined,
        crypto.randomUUID()
      );
      onRefresh();
    } catch (cause) {
      const failure = apiFailure(cause);
      if (failure?.status === 409) {
        setError("The ticket already has an active run. Wait for it to finish.");
      } else if (failure?.status === 400) {
        setError("Your operator session was lost. Sign in again before re-running.");
      } else {
        setError(failure?.message ?? "The re-run could not be queued.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {blocked ? (
        <Button variant="outline" size="sm" disabled title={blocked}>
          <RotateCwIcon data-icon="inline-start" />
          Re-run agent
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="outline" size="sm" disabled={pending} />}
          >
            {pending ? <Spinner data-icon="inline-start" /> : <RotateCwIcon data-icon="inline-start" />}
            Re-run agent
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Re-run the agent on this ticket?</AlertDialogTitle>
              <AlertDialogDescription>
                This queues a new run on a new checkpoint thread. It produces a new draft that
                still needs a human approval; nothing is sent or executed by re-running.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void run()} disabled={pending}>
                Queue re-run
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {error && (
        <Alert variant="destructive" className="max-w-xs">
          <AlertTriangleIcon />
          <AlertTitle>Re-run failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
