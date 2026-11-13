import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => renderValue(item)).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function label(key: string): string {
  return key.replace(/_/g, " ");
}

/**
 * Evidence is kind-dependent jsonb. Only `kb_ids` is treated specially; every
 * other key is rendered as a raw key/value pair so nothing is hidden.
 */
export function EvidenceList({
  evidence,
  onCitation,
}: {
  evidence: Record<string, unknown> | null;
  onCitation?: (kbId: string) => void;
}) {
  if (!evidence) {
    return <p className="text-xs text-muted-foreground">No evidence recorded.</p>;
  }

  const kbIds = Array.isArray(evidence.kb_ids)
    ? evidence.kb_ids.filter((item): item is string => typeof item === "string")
    : [];
  const rest = Object.entries(evidence).filter(([key]) => key !== "kb_ids");

  if (kbIds.length === 0 && rest.length === 0) {
    return <p className="text-xs text-muted-foreground">No evidence recorded.</p>;
  }

  return (
    <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
      {kbIds.length > 0 && (
        <>
          <dt className="text-muted-foreground">kb ids</dt>
          <dd className="flex flex-wrap gap-1">
            {kbIds.map((kbId) => (
              <Button
                key={kbId}
                type="button"
                variant="outline"
                size="xs"
                className="font-mono"
                onClick={() => onCitation?.(kbId)}
                disabled={!onCitation}
                aria-label={onCitation ? `Open citation ${kbId}` : `Citation ${kbId}`}
              >
                {kbId}
              </Button>
            ))}
          </dd>
        </>
      )}
      {rest.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="break-words text-muted-foreground">{label(key)}</dt>
          <dd className="break-all font-mono text-[0.6875rem]">
            {typeof value === "string" && key.includes("id") ? (
              <Kbd className="font-mono">{renderValue(value)}</Kbd>
            ) : (
              renderValue(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
