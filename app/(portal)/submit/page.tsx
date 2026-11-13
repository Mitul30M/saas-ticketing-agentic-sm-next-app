import type { Metadata } from "next";
import { ClockIcon, ShieldCheckIcon, UserRoundCheckIcon } from "lucide-react";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Contact support" };

const FACTS = [
  {
    icon: UserRoundCheckIcon,
    title: "A human reviews it",
    body: "The agent can draft and propose, but a person decides.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Nothing runs automatically",
    body: "Refunds and plan changes wait for an explicit approval.",
  },
  {
    icon: ClockIcon,
    title: "One message is enough",
    body: "Sending the same text again keeps the same ticket.",
  },
] as const;

export default function SubmitPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nimbus support
        </p>
        <h1 className="text-xl font-medium tracking-tight sm:text-2xl">How can we help?</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Describe the problem in your own words. We&apos;ll look at your account and the
          knowledge base before replying.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <SubmitForm />

        <aside className="flex flex-col gap-4">
          {FACTS.map((fact) => (
            <div key={fact.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card">
                <fact.icon aria-hidden className="size-3.5 text-muted-foreground" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium">{fact.title}</p>
                <p className="text-xs/relaxed text-muted-foreground">{fact.body}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
