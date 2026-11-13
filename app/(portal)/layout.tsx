import Link from "next/link";
import { CircleDotIcon, ShieldCheckIcon } from "lucide-react";

export default function PortalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/submit" className="flex items-center gap-2 font-medium">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CircleDotIcon aria-hidden className="size-3.5" />
            </span>
            <span>Nimbus</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheckIcon aria-hidden className="size-3.5" />
            Agent console
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>A human reviews every request.</span>
          <span>Nimbus support</span>
        </div>
      </footer>
    </div>
  );
}
