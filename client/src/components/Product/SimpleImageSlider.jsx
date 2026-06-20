import GalleryImage from "./GalleryImage";
import { normalizeProductImages } from "@/utils/productImages";

/** Index-based slider: sirf active index se translateX. */
export default function SimpleImageSlider({
  images = [],
  index = 0,
  fit = "contain",
  className = "",
  imgClassName = "",
}) {
  const galleryImages = normalizeProductImages(images);
  if (!galleryImages.length) return null;

  return (
    <div className={`h-full w-full overflow-hidden ${className}`}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {galleryImages.map((img, i) => (
          <div
            key={i}
            className="flex h-full w-full shrink-0 items-center justify-center"
          >
            <GalleryImage
              src={img.url}
              alt=""
              fit={fit}
              priority={i === index}
              className={`h-full w-full select-none pointer-events-none ${imgClassName}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
