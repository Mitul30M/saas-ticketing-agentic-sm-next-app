import type { DecideRequest } from "@/lib/api-types";

export interface SubmitResult {
  ok: boolean;
  message?: string;
}

export type DecisionSubmit = (body: DecideRequest) => Promise<SubmitResult>;
