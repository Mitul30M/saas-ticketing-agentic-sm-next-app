import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * KB bodies are trusted repo content, but the pipeline still never executes
 * HTML: react-markdown without rehype-raw drops raw tags.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-xs/relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: value }) => (
            <h1 className="mt-1 mb-2 text-base font-medium tracking-tight">{value}</h1>
          ),
          h2: ({ children: value }) => (
            <h2 className="mt-4 mb-1.5 text-sm font-medium">{value}</h2>
          ),
          h3: ({ children: value }) => (
            <h3 className="mt-3 mb-1 text-xs font-medium">{value}</h3>
          ),
          p: ({ children: value }) => (
            <p className="mb-2 leading-relaxed last:mb-0">{value}</p>
          ),
          ul: ({ children: value }) => (
            <ul className="mb-2 flex list-disc flex-col gap-1 pl-5">{value}</ul>
          ),
          ol: ({ children: value }) => (
            <ol className="mb-2 flex list-decimal flex-col gap-1 pl-5">{value}</ol>
          ),
          li: ({ children: value }) => <li className="leading-relaxed">{value}</li>,
          a: ({ children: value, href }) => (
            <a
              href={href}
              rel="noreferrer noopener"
              className="underline underline-offset-4 hover:text-primary"
            >
              {value}
            </a>
          ),
          code: ({ children: value, className: language }) => (
            <code
              className={cn(
                "rounded bg-muted px-1 py-0.5 font-mono text-[0.6875rem]",
                language
              )}
            >
              {value}
            </code>
          ),
          pre: ({ children: value }) => (
            <pre className="mb-2 overflow-x-auto rounded-md border bg-muted/40 p-2 text-[0.6875rem]">
              {value}
            </pre>
          ),
          blockquote: ({ children: value }) => (
            <blockquote className="mb-2 border-l-2 pl-3 text-muted-foreground">{value}</blockquote>
          ),
          table: ({ children: value }) => (
            <div className="mb-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{value}</table>
            </div>
          ),
          th: ({ children: value }) => (
            <th className="border-b px-2 py-1 text-left font-medium">{value}</th>
          ),
          td: ({ children: value }) => <td className="border-b px-2 py-1">{value}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
