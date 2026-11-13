import { AlertTriangleIcon, BookOpenIcon } from "lucide-react";
import { Markdown } from "@/components/kb/markdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { KbArticle } from "@/lib/api-types";
import { formatDate } from "@/lib/format";

export function KbArticlePanel({
  selectedId,
  article,
  loading,
  error,
}: {
  selectedId: string | null;
  article: KbArticle | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card size="sm" className="min-h-96">
        <CardContent className="flex items-center gap-2 py-10 text-xs text-muted-foreground">
          <Spinner />
          Loading {selectedId ?? "article"}…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="min-h-96">
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Article unavailable</AlertTitle>
            <AlertDescription>
              {error} {selectedId ? <Kbd className="ml-1 font-mono">{selectedId}</Kbd> : null}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card size="sm" className="min-h-96">
        <CardContent className="pt-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpenIcon />
              </EmptyMedia>
              <EmptyTitle>Choose an article</EmptyTitle>
              <EmptyDescription>
                Browse the index or search for a phrase to read the Markdown source.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="min-h-96">
      <CardHeader>
        <CardTitle className="text-base">{article.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Kbd className="font-mono">{article.id}</Kbd>
          <Badge variant="outline">{article.category ?? "uncategorised"}</Badge>
          <span>updated {formatDate(article.updated)}</span>
        </div>
      </CardHeader>
      <CardContent className="max-h-[34rem] overflow-y-auto">
        <Markdown>{article.body}</Markdown>
      </CardContent>
    </Card>
  );
}
