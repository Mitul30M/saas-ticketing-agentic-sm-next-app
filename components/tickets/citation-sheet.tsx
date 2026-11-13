"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import type { KbArticle } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/kb/markdown";

// Session-wide cache: a citation opened twice does not hit the backend twice.
const cache = new Map<string, KbArticle>();

function CitationBody({ kbId }: { kbId: string }) {
  const [article, setArticle] = useState<KbArticle | null>(() => cache.get(kbId) ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(kbId)) return;
    const controller = new AbortController();

    clientGet<KbArticle>(`kb/articles/${kbId}`, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        cache.set(kbId, next);
        setArticle(next);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const failure = apiFailure(cause);
        setError(failure?.status === 404 ? "This article is unavailable." : failure?.message ?? "Could not load the article.");
      });

    return () => controller.abort();
  }, [kbId]);

  if (article) return <Markdown>{article.body}</Markdown>;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon />
        <AlertTitle>Article unavailable</AlertTitle>
        <AlertDescription>
          {kbId} could not be loaded. {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Spinner />
      Loading {kbId}…
    </div>
  );
}

export function CitationSheet({
  kbId,
  onClose,
}: {
  kbId: string | null;
  onClose: () => void;
}) {
  const article = kbId ? cache.get(kbId) : null;

  return (
    <Sheet open={kbId !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{article?.title ?? kbId ?? "Citation"}</SheetTitle>
          <SheetDescription>
            {article
              ? `${article.id} · ${article.category ?? "uncategorised"} · updated ${formatDate(article.updated)}`
              : `${kbId ?? ""} · knowledge-base article`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{kbId && <CitationBody key={kbId} kbId={kbId} />}</div>
      </SheetContent>
    </Sheet>
  );
}
