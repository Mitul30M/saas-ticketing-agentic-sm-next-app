"use client";

import { useState } from "react";
import { AlertTriangleIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { DecisionSubmit } from "./types";

const MAX = 2000;

export function RejectDecisionDialog({
  onSubmit,
  pending,
  disabled,
}: {
  onSubmit: DecisionSubmit;
  pending: boolean;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function changeOpen(next: boolean) {
    if (next) {
      setNote("");
      setError(null);
    }
    setOpen(next);
  }

  async function handleSubmit() {
    if (note.length > MAX) {
      setError("Use 2,000 characters or fewer.");
      return;
    }
    setError(null);
    const result = await onSubmit({ decision: "reject", note: note.trim() || null });
    if (result.ok) setOpen(false);
    else setError(result.message ?? "The rejection was not recorded.");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" disabled={disabled} />}
      >
        <XIcon data-icon="inline-start" />
        Reject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this action?</DialogTitle>
          <DialogDescription>
            No reply is sent and nothing is executed. The ticket is parked for a human. The rejection
            is recorded against your audit label.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={MAX}
            aria-label="Rejection note (optional)"
            placeholder="Optional note for the audit trail"
          />
          <span className="text-xs text-muted-foreground">
            {note.length.toLocaleString("en-US")} / 2,000 characters
          </span>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Rejection not recorded</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" size="sm" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleSubmit()}
            disabled={pending}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Reject action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
