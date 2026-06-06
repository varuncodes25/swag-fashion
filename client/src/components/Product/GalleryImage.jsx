import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { optimizeGalleryImage } from "@/utils/productImages";

export default function GalleryImage({
  src,
  alt = "",
  className = "",
  fit = "cover",
  priority = false,
  thumb = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const optimizedSrc = optimizeGalleryImage(src, { thumb });

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [optimizedSrc]);

  const fitClass =
    fit === "contain"
      ? "max-h-full max-w-full object-contain object-center"
      : "h-full w-full object-cover object-top";

  if (!optimizedSrc || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted/40 ${className}`}
      >
        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/60" aria-hidden />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${fitClass} transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
