import { AdNative } from "./AdNative";
import { AdBanner } from "./AdBanner";

/**
 * Decide which ad slot (if any) to render after card at `index`.
 * Same zone ids repeat — Adsterra rotates creatives per impression.
 *
 * Default cadence:
 *  - every 4 cards   → Native Banner
 *  - every 7 cards   → 300x250 (mobile only)
 *  - every 10 cards  → 728x90 (desktop only)
 *
 * `forceShow` renders an ad on every index, rotating slot type by index.
 */
export function InFeedAd({
  index,
  fullWidthClass = "",
  forceShow = false,
}: {
  index: number;
  fullWidthClass?: string;
  forceShow?: boolean;
}) {
  let slot: "native" | "300x250" | "728x90" | null;
  if (forceShow) {
    // Lighter formats first, native deeper
    const rot = index % 3;
    slot = rot === 0 ? "300x250" : rot === 1 ? "728x90" : "native";
  } else {
    const n = index + 1;
    // First ad slots prefer the lighter 300x250; native only deeper in feed
    slot = n % 4 === 0 && n >= 8 ? "native" : n % 3 === 0 ? "300x250" : n % 10 === 0 ? "728x90" : null;
  }

  if (!slot) return null;

  if (slot === "native") {
    return (
      <div className={fullWidthClass}>
        <AdNative />
      </div>
    );
  }
  if (slot === "300x250") {
    return (
      <div className={`flex justify-center md:hidden ${fullWidthClass}`}>
        <AdBanner size="300x250" />
      </div>
    );
  }
  return (
    <div className={`hidden justify-center md:flex ${fullWidthClass}`}>
      <AdBanner size="728x90" />
    </div>
  );
}
