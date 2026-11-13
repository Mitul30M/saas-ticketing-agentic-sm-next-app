import { ShieldAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { flagCopy } from "@/lib/status";

export function InjectionBanner({
  suspected,
  flags,
}: {
  suspected: boolean;
  flags: readonly string[];
}) {
  if (!suspected && flags.length === 0) return null;

  return (
    <Alert variant="destructive">
      <ShieldAlertIcon />
      <AlertTitle>Possible prompt injection</AlertTitle>
      <AlertDescription>
        <p>
          The ticket text looks like it tried to instruct the agent. Flags only tighten the
          agent&apos;s behaviour. The agent will not act without you.
        </p>
        <ul className="mt-2 flex flex-wrap gap-1">
          {flags.map((flag) => (
            <li key={flag}>
              <Badge variant="outline" className="font-mono">
                {flag}
              </Badge>
              <span className="ml-1 text-xs text-muted-foreground">{flagCopy(flag)}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
