import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StatusMeta } from "@/lib/status";

export function MetaBadge({
  meta,
  icon: Icon,
  className,
}: {
  meta: StatusMeta;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Badge variant={meta.variant} className={className}>
      {Icon ? <Icon aria-hidden /> : null}
      {meta.label}
    </Badge>
  );
}
