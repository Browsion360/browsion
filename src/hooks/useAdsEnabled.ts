import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { effectivePlan } from "@/lib/plan";

const BLOCKED_PREFIXES = [
  "/auth",
  "/pricing",
  "/my-account",
  "/preferences",
  "/notifications",
  "/saved",
  "/admin",
];

export function useAdsEnabled(): boolean {
  const { pathname } = useLocation();
  const { appUser } = useAuth();
  if (BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return false;
  const plan = effectivePlan(appUser?.plan ?? "free", appUser?.plan_expiry);
  // Premium plans = no ads
  if (plan === "ad_free" || plan === "explorer") return false;
  return true;
}
