export type PlanTier = "free" | "ad_free" | "explorer";

export const PLAN_PRICES: Record<PlanTier, number> = {
  free: 0,
  ad_free: 199,
  explorer: 500,
};

export const UNLOCK_PRICE = 150;

export const PLAN_LABEL: Record<PlanTier, string> = {
  free: "Free",
  ad_free: "Ad-Free",
  explorer: "Explorer",
};

export function favouriteLimit(plan: PlanTier) {
  return plan === "explorer" ? 5 : 0;
}

export function planActive(plan: PlanTier, expiry: string | null | undefined) {
  if (plan === "free") return true;
  if (!expiry) return false;
  return new Date(expiry).getTime() > Date.now();
}

export function effectivePlan(plan: PlanTier, expiry: string | null | undefined): PlanTier {
  if (plan === "free") return "free";
  if (planActive(plan, expiry)) return plan;
  return "free";
}

export const BKASH_MERCHANT = "01XXXXXXXXX"; // placeholder — admin should change

// USDT (BSC / BEP-20) premium offer
export const USDT_ADDRESS = "0xd870dd15ae638b110edc00755b9f74e30da49ee9";
export const USDT_NETWORK = "BSC (BEP-20)";
export const USDT_PRICES = {
  monthly: 5,
  lifetime: 9,
} as const;
