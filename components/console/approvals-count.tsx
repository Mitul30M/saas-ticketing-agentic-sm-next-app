import { SidebarMenuBadge } from "@/components/ui/sidebar";
import { api } from "@/lib/nimbus";

/** Badge value for the sidebar. A backend failure hides the badge, never the app. */
export async function ApprovalsCount() {
  let count = 0;
  try {
    const { items } = await api.pending();
    count = items.length;
  } catch {
    return null;
  }

  if (count === 0) return null;
  return (
    <SidebarMenuBadge aria-label={`${count} pending approvals`}>{count}</SidebarMenuBadge>
  );
}
