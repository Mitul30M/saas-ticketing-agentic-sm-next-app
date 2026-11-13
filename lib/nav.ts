export interface NavItem {
  href: string;
  label: string;
  exact: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Tickets", exact: true },
  { href: "/dashboard/approvals", label: "Approvals", exact: false },
  { href: "/dashboard/metrics", label: "Metrics", exact: false },
  { href: "/dashboard/kb", label: "Knowledge base", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

export function isNavActive(href: string, exact: boolean, pathname: string): boolean {
  if (exact) return pathname === href || pathname.startsWith("/dashboard/tickets/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function consoleSectionLabel(pathname: string): string {
  if (pathname.startsWith("/dashboard/tickets/")) return "Ticket detail";
  if (pathname === "/dashboard/approvals") return "Approvals";
  if (pathname === "/dashboard/metrics") return "Metrics";
  if (pathname === "/dashboard/kb") return "Knowledge base";
  if (pathname === "/dashboard/settings") return "Settings";
  return "Tickets";
}
