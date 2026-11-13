"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { KbArticlePanel } from "@/components/kb/kb-article-panel";
import { KbList } from "@/components/kb/kb-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { KbArticle, KbArticleSummary, KbSearchHit, KbSearchResponse } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";

interface SearchState {
  query: string;
  hits: KbSearchHit[];
  error: string | null;
  loading: boolean;
}

interface ArticleState {
  article: KbArticle | null;
  loading: boolean;
  error: string | null;
}

const MIN_QUERY = 3;

export function KbBrowser({
  initialArticles,
  initialArticle,
}: {
  initialArticles: KbArticleSummary[];
  initialArticle: KbArticle | null;
}) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({
    query: "",
    hits: [],
    error: null,
    loading: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(initialArticle?.id ?? null);
  const [articleState, setArticleState] = useState<ArticleState>({
    article: initialArticle,
    loading: false,
    error: null,
  });

  const cache = useRef<Map<string, KbArticle>>(
    new Map(initialArticle ? [[initialArticle.id, initialArticle]] : [])
  );
  const requestSeq = useRef(0);

  useEffect(() => {
    return () => {
      requestSeq.current += 1;
    };
  }, []);

  const trimmed = query.trim();
  const searchMode = trimmed.length >= MIN_QUERY;
  const searchLoading =
    searchMode && (search.loading || search.query !== trimmed);
  const results = searchMode && search.query === trimmed ? search.hits : null;
  const searchError = searchMode && search.query === trimmed ? search.error : null;

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearch({ query: trimmed, hits: [], error: null, loading: true });
      clientGet<KbSearchResponse>(`kb/search?q=${encodeURIComponent(trimmed)}`, controller.signal)
        .then((response) => {
          if (controller.signal.aborted) return;
          setSearch({ query: trimmed, hits: response.items, error: null, loading: false });
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return;
          const failure = apiFailure(cause);
          setSearch({
            query: trimmed,
            hits: [],
            error:
              failure?.status === 422
                ? "Search needs at least 3 characters."
                : failure?.message ?? "The search could not be completed.",
            loading: false,
          });
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  async function selectArticle(id: string) {
    setSelectedId(id);
    const cached = cache.current.get(id);
    if (cached) {
      setArticleState({ article: cached, loading: false, error: null });
      return;
    }

    const sequence = ++requestSeq.current;
    setArticleState({ article: null, loading: true, error: null });
    try {
      const article = await clientGet<KbArticle>(`kb/articles/${id}`);
      if (sequence !== requestSeq.current) return;
      cache.current.set(id, article);
      setArticleState({ article, loading: false, error: null });
    } catch (cause) {
      if (sequence !== requestSeq.current) return;
      const failure = apiFailure(cause);
      setArticleState({
        article: null,
        loading: false,
        error:
          failure?.status === 404
            ? "This article is not available."
            : failure?.message ?? "The article could not be loaded.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <SearchIcon />
        <AlertTitle>This is full-text search for humans</AlertTitle>
        <AlertDescription>
          It queries Postgres <code className="font-mono">ts_rank</code> over KB chunks. The agent
          uses a different hybrid retriever, so these results are not necessarily what it saw.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
            <CardDescription>
              {searchMode
                ? `${results?.length ?? 0} chunk matches`
                : `${initialArticles.length} indexed articles`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the KB (min 3 chars)"
                aria-label="Search the knowledge base"
              />
              {query.length > 0 && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton aria-label="Clear knowledge-base search" onClick={() => setQuery("")}>
                    <XIcon aria-hidden />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>

            {!searchMode && query.trim().length > 0 && (
              <p className="text-xs text-muted-foreground">
                Type at least {MIN_QUERY} characters to search; the index is still browsable.
              </p>
            )}

            {searchError && (
              <Alert variant="destructive">
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            <div className="sr-only" aria-live="polite">
              {searchMode && results ? `${results.length} search results` : ""}
            </div>

            <KbList
              articles={initialArticles}
              results={results}
              activeId={selectedId}
              loading={searchLoading}
              onSelect={(id) => void selectArticle(id)}
            />
          </CardContent>
        </Card>

        <KbArticlePanel
          selectedId={selectedId}
          article={articleState.article}
          loading={articleState.loading}
          error={articleState.error}
        />
      </div>
    </div>
  );
}
