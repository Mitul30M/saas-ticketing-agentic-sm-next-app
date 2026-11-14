import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { CircleDotIcon } from "lucide-react";
import { ConsoleBreadcrumb } from "@/components/console/console-breadcrumb";
import { SidebarNav } from "@/components/console/sidebar-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarNavFallback() {
  return (
    <div className="flex flex-col gap-1 p-2" aria-hidden>
      <Skeleton className="mb-2 h-3 w-16" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full rounded-md" />
      ))}
    </div>
  );
}

export function ConsoleShell({
  children,
  operatorSlot,
  approvalsBadge,
}: {
  children: ReactNode;
  operatorSlot: ReactNode;
  approvalsBadge?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <a
        href="#console-main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <CircleDotIcon aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">Nimbus</span>
                  <span className="truncate text-[0.625rem] text-muted-foreground">
                    Agent console
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<SidebarNavFallback />}>
            <SidebarNav approvalsBadge={approvalsBadge} />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
          <p className="rounded-md border bg-sidebar-accent/40 p-2 text-[0.625rem] leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
            The agent proposes. A human decides.
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset id="console-main">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="h-4" />
          <Suspense fallback={<Skeleton className="h-4 w-20" />}>
            <ConsoleBreadcrumb />
          </Suspense>
          <div className="ml-auto flex items-center gap-1.5">
            <ModeToggle />
            {operatorSlot}
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
