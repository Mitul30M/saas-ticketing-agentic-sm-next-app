"use client";

import { useState } from "react";
import { AlertTriangleIcon, PencilIcon } from "lucide-react";
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
import type { PendingApproval } from "@/lib/api-types";
import type { DecisionSubmit } from "./types";

const MAX = 4000;

export function EditReplyDialog({
  item,
  onSubmit,
  pending,
  disabled,
}: {
  item: PendingApproval;
  onSubmit: DecisionSubmit;
  pending: boolean;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(item.draft_reply ?? "");
  const [error, setError] = useState<string | null>(null);

  function changeOpen(next: boolean) {
    if (next) {
      setText(item.draft_reply ?? "");
      setError(null);
    }
    setOpen(next);
  }

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("The edited reply cannot be empty.");
      return;
    }
    if (text.length > MAX) {
      setError("Use 4,000 characters or fewer.");
      return;
    }
    setError(null);
    const result = await onSubmit({ decision: "edit", edited_text: text, note: null });
    if (result.ok) setOpen(false);
    else setError(result.message ?? "The edit was not recorded.");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" disabled={disabled} />}
      >
        <PencilIcon data-icon="inline-start" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit the reply</DialogTitle>
          <DialogDescription>
            Recording this edit approves and sends the edited text to the customer. This click is
            the human decision — there is no second send.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            maxLength={MAX}
            aria-label="Edited reply"
            className="min-h-48 resize-y"
          />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{text.length.toLocaleString("en-US")} / 4,000 characters</span>
            <span>Citations are plain text here.</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Edit not recorded</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" size="sm" />}>
            Cancel
          </DialogClose>
          <Button type="button" size="sm" onClick={() => void handleSubmit()} disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Send edited reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
