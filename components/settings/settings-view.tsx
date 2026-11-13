import Link from "next/link";
import {
  CircleCheckIcon,
  CircleXIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
  ServerIcon,
  ShieldAlertIcon,
  UserRoundIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import type { BackendConfig } from "@/lib/nimbus";

export interface SettingsFacts {
  config: BackendConfig;
  operator: string | null;
  health: { ok: boolean; detail: string };
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge variant={ok ? "outline" : "destructive"}>
      {ok ? <CircleCheckIcon aria-hidden /> : <CircleXIcon aria-hidden />}
      {label}
    </Badge>
  );
}

export function SettingsView({ config, operator, health }: SettingsFacts) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <ServerIcon aria-hidden className="size-3.5 text-muted-foreground" />
            Backend connection
          </CardTitle>
          <CardDescription>
            Server-side configuration. The token value is never rendered.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">API host</span>
            <Kbd className="font-mono">{config.host}</Kbd>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <KeyRoundIcon aria-hidden className="size-3.5" />
              Agent token
            </span>
            <StatusPill
              ok={config.tokenConfigured}
              label={config.tokenConfigured ? "configured" : "missing"}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">/healthz</span>
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">{health.detail}</span>
              <StatusPill ok={health.ok} label={health.ok ? "ok" : "unavailable"} />
            </span>
          </div>
          <p className="text-muted-foreground">
            A missing token makes every dashboard route return 503 by design. Change{" "}
            <Kbd className="font-mono">NIMBUS_API_URL</Kbd> and{" "}
            <Kbd className="font-mono">AGENT_TOKEN</Kbd> in <Kbd className="font-mono">.env.local</Kbd>.
          </p>
          <Link
            href={`${config.baseUrl}/docs`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex w-fit items-center gap-1 underline underline-offset-4 hover:text-foreground"
          >
            FastAPI docs
            <ExternalLinkIcon aria-hidden className="size-3" />
          </Link>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <UserRoundIcon aria-hidden className="size-3.5 text-muted-foreground" />
            Operator label
          </CardTitle>
          <CardDescription>
            Written to decisions and the audit log. It is not a login.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium">{operator ?? "not set"}</span>
          </div>
          <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-2 text-muted-foreground">
            <ShieldAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <p>
              Anyone can type any name; there are no operator accounts or per-user permissions.
              This mirrors the backend&apos;s documented limitation. Do not treat it as verified
              identity.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Known limits in this console</CardTitle>
          <CardDescription>Stated rather than hidden.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs text-muted-foreground">
            <li>No SSE or WebSocket: list, detail and approvals poll on a visible-tab timer.</li>
            <li>The ticket list has no total count, so pagination is previous/next only.</li>
            <li>No approvals-history or outbox-list endpoint: the detail page shows the latest sent reply.</li>
            <li>No ticket mutation API: the console can re-run and decide, not assign or close.</li>
            <li>Eval results are offline files in the backend repo, not API data.</li>
            <li>
              <Kbd className="font-mono">admin/*</Kbd> routes are excluded from the proxy
              allow-list even when the backend mounts them.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Backend documents</CardTitle>
          <CardDescription>Read these in the backend repository, not from this app.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
          {[
            "plans/frontend-api-guide.MD",
            "docs/VERIFY.md",
            "docs/EVAL_RESULTS.md",
            "docs/FAILURE_ANALYSIS.md",
            "plans/backend-guide.MD",
          ].map((path) => (
            <div key={path} className="flex items-center gap-2">
              <Kbd className="font-mono">{path}</Kbd>
            </div>
          ))}
          <p className="mt-1">
            The backend repository is read-only for this app. A contract change starts there, then
            in the API guide, then in the frontend types.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
