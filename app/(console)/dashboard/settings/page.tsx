import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSkeleton } from "@/components/settings/settings-skeleton";
import { SettingsView } from "@/components/settings/settings-view";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api, backendConfig } from "@/lib/nimbus";
import { getOperator } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Read-only facts for diagnosing &ldquo;why is everything 503&rdquo;. No secrets are shown.
        </p>
      </header>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsLoader />
      </Suspense>
    </div>
  );
}

async function SettingsLoader() {
  const config = backendConfig();
  const operator = await getOperator();

  let health = { ok: false, detail: "unreachable" };
  try {
    const response = await api.health();
    health = { ok: response.status === "ok", detail: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      health = { ok: false, detail: detailMessage(error.detail) };
    } else {
      health = { ok: false, detail: "unreachable" };
    }
  }

  return <SettingsView config={config} operator={operator} health={health} />;
}
