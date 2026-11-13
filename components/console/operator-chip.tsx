import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-actions";
import { operatorInitials } from "@/lib/operator";
import { getOperator } from "@/lib/session";

export async function OperatorChip() {
  const operator = await getOperator();
  const label = operator ?? "Unknown operator";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="max-w-40 truncate text-xs font-medium leading-none">{label}</p>
        <p className="mt-1 text-[0.625rem] text-muted-foreground">audit label, not a login</p>
      </div>
      <Avatar className="size-7">
        <AvatarFallback className="text-[0.625rem]">{operatorInitials(label)}</AvatarFallback>
      </Avatar>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
          <LogOutIcon />
        </Button>
      </form>
    </div>
  );
}
