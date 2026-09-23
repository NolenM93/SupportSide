import { BASE_CREDIT_COST } from "@/lib/env";

export function creditsForUsage(totalTokens?: number) {
  if (!totalTokens || totalTokens <= 0) return BASE_CREDIT_COST;
  return BASE_CREDIT_COST + Math.ceil(totalTokens / 1000);
}
