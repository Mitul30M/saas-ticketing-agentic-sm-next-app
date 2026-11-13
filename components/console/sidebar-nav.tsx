"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpenIcon,
  ChartNoAxesColumnIcon,
  InboxIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isNavActive, NAV_ITEMS } from "@/lib/nav";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboardIcon,
  "/dashboard/approvals": InboxIcon,
  "/dashboard/metrics": ChartNoAxesColumnIcon,
  "/dashboard/kb": BookOpenIcon,
  "/dashboard/settings": SettingsIcon,
};

export function SidebarNav({ approvalsBadge }: { approvalsBadge?: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.href] ?? LayoutDashboardIcon;
            const active = isNavActive(item.href, item.exact, pathname);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  aria-current={active ? "page" : undefined}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                >
                  <Icon aria-hidden />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.href === "/dashboard/approvals" && approvalsBadge}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
