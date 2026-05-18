import { AdBanner } from "./AdBanner";

/** 320x50 on mobile, 728x90 on desktop — single instance, top of page. */
export function TopBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="md:hidden">
        <AdBanner size="320x50" />
      </div>
      <div className="hidden md:block">
        <AdBanner size="728x90" />
      </div>
    </div>
  );
}
