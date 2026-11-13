"use client";

import { formatDate, relative } from "@/lib/format";
import type { KbArticleSummary, KbSearchHit } from "@/lib/api-types";
import { cn } from "@/lib/utils";

export function KbList({
  articles,
  results,
  activeId,
  loading,
  onSelect,
}: {
  articles: KbArticleSummary[];
  results: KbSearchHit[] | null;
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-6 text-center text-xs text-muted-foreground">
        Searching the knowledge base…
      </div>
    );
  }

  if (results !== null) {
    if (results.length === 0) {
      return (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No chunks matched that search. Try a broader phrase.
        </p>
      );
    }
    return (
      <ul className="flex max-h-[34rem] flex-col gap-1 overflow-y-auto pr-1" aria-label="Search results">
        {results.map((hit) => {
          const active = hit.kb_id === activeId;
          return (
            <li key={`${hit.kb_id}-${hit.chunk_idx}`}>
              <button
                type="button"
                onClick={() => onSelect(hit.kb_id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/60",
                  active && "border-ring bg-muted/50"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.625rem] text-muted-foreground">
                    {hit.kb_id} · chunk {hit.chunk_idx}
                  </span>
                  <span className="text-[0.625rem] text-muted-foreground">
                    {relative(hit.updated_at)}
                  </span>
                </span>
                <span className="font-medium">{hit.title}</span>
                <span className="line-clamp-2 text-muted-foreground">{hit.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        The knowledge base is empty. Run the backend ingest once.
      </p>
    );
  }

  return (
    <ul className="flex max-h-[34rem] flex-col gap-1 overflow-y-auto pr-1" aria-label="Knowledge-base articles">
      {articles.map((article) => {
        const active = article.id === activeId;
        return (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => onSelect(article.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/60",
                active && "border-ring bg-muted/50"
              )}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[0.625rem] text-muted-foreground">
                  {article.id}
                </span>
                <span className="truncate font-medium">{article.title}</span>
              </span>
              <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                {formatDate(article.updated)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
