import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { optimizeGalleryImage } from "@/utils/productImages";

function isImageCached(src) {
  if (!src) return false;
  const probe = new window.Image();
  probe.src = src;
  return probe.complete && probe.naturalWidth > 0;
}

export default function GalleryImage({
  src,
  alt = "",
  className = "",
  fit = "cover",
  priority = false,
  thumb = false,
}) {
  const imgRef = useRef(null);
  const optimizedSrc = optimizeGalleryImage(src, { thumb });
  const [loaded, setLoaded] = useState(() => isImageCached(optimizedSrc));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (!optimizedSrc) {
      setLoaded(false);
      return;
    }

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    if (isImageCached(optimizedSrc)) {
      setLoaded(true);
      return;
    }

    setLoaded(false);
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
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`${fitClass} transition-opacity duration-300 ${
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
