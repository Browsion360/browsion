import { useState } from "react";

type Props = {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
  /** Apply blur-photo lock styling (e.g., locked profiles). */
  locked?: boolean;
  onLoad?: () => void;
  /** Width/height hints for the foreground image. */
  width?: number;
  height?: number;
};

/**
 * Instagram-style smart photo: shows the full image (object-contain) with a
 * blurred, scaled copy of itself filling the empty space behind it. No face or
 * body cropping, regardless of the source aspect ratio.
 *
 * Place inside a parent that defines the aspect ratio and `relative`.
 */
export function SmartPhoto({
  src,
  alt,
  priority = false,
  className = "",
  locked = false,
  onLoad,
  width,
  height,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
        No photo
      </div>
    );
  }

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <>
      {/* Blurred background fill — same src, no extra request */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-90 saturate-125"
      />
      {/* Soft dim overlay for legibility of overlays placed on top */}
      <div className="absolute inset-0 bg-black/10" />
      {/* Foreground full image — never cropped */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        // @ts-ignore - valid HTML attribute
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        width={width}
        height={height}
        onLoad={handleLoad}
        className={`relative h-full w-full object-contain transition-all duration-700 ease-out ${
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        } ${locked ? "blur-photo" : ""} ${className}`}
      />
    </>
  );
}
