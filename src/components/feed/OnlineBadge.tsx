import { cn } from "@/lib/utils";

export function OnlineBadge({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dot = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  const text = size === "md" ? "text-xs" : "text-[10px]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300 ring-1 ring-emerald-400/40 backdrop-blur-sm",
        text,
        className,
      )}
      aria-label="এখন অনলাইন"
    >
      <span className="relative flex">
        <span className={cn("absolute inline-flex animate-ping rounded-full bg-emerald-400 opacity-75", dot)} />
        <span className={cn("relative inline-flex rounded-full bg-emerald-400", dot)} />
      </span>
      এখন অনলাইন
    </span>
  );
}
