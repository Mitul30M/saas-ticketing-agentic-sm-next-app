import type { Metadata } from "next";
import { Suspense } from "react";
import { KbBrowser } from "@/components/kb/kb-browser";
import { KbSkeleton } from "@/components/kb/kb-skeleton";
import { BackendBanner } from "@/components/system/backend-banner";
import type { KbArticle, KbArticlesResponse } from "@/lib/api-types";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api } from "@/lib/nimbus";

export const metadata: Metadata = { title: "Knowledge base" };

export default function KbPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium tracking-tight">Knowledge base</h1>
        <p className="text-xs text-muted-foreground">
          Browse the Markdown articles and search them as text. The agent&apos;s retriever is a
          different pipeline.
        </p>
      </header>
      <Suspense fallback={<KbSkeleton />}>
        <KbLoader />
      </Suspense>
    </div>
  );
}

async function KbLoader() {
  let articles: KbArticlesResponse | null = null;
  let failure: { status: number; detail: string } | null = null;

  try {
    articles = await api.kbArticles(50);
  } catch (error) {
    if (error instanceof ApiError) {
      failure = { status: error.status, detail: detailMessage(error.detail) };
    } else {
      throw error;
    }
  }

  if (failure) return <BackendBanner status={failure.status} detail={failure.detail} />;
  if (!articles) {
    return <BackendBanner status={503} detail="The backend returned an empty KB response." />;
  }

  const first = articles.items[0];
  let article: KbArticle | null = null;
  if (first) {
    try {
      article = await api.kbArticle(first.id);
    } catch {
      // The index is still useful when the first body fails to load.
      article = null;
    }
  }

  return <KbBrowser initialArticles={articles.items} initialArticle={article} />;
}
