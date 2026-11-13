"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CITATION = /(\[KB-\d+\])/g;

/**
 * Renders the draft as plain text and turns `[KB-xxx]` into citation buttons.
 * Ticket/draft text is never interpreted as HTML or Markdown.
 */
export function DraftText({
  text,
  onCitation,
  className,
}: {
  text: string;
  onCitation: (kbId: string) => void;
  className?: string;
}) {
  const parts = text.split(CITATION);

  return (
    <p className={cn("whitespace-pre-wrap break-words text-xs/relaxed leading-relaxed", className)}>
      {parts.map((part, index) => {
        if (/^\[KB-\d+\]$/.test(part)) {
          const kbId = part.slice(1, -1);
          return (
            <Button
              key={`${part}-${index}`}
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0 align-baseline font-mono text-xs"
              onClick={() => onCitation(kbId)}
              aria-label={`Open citation ${kbId}`}
            >
              {part}
            </Button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
