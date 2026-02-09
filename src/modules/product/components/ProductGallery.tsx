"use client";

import Image from "next/image";
import { useState } from "react";

export interface ProductImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainImage = images[activeIndex] ?? images[0];

  const mainSrc = mainImage
    ? mainImage.url.replace("200x200", "800x800")
    : "";

  return (
    <div>
      {/* Imagen Principal */}
      <div className="mb-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-sand-50">
          {mainImage && mainSrc ? (
            <Image
              src={mainSrc}
              alt={mainImage.alt || productTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : null}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:opacity-70 ${
                isActive ? "border-walnut-500" : "border-sand-600"
              }`}
              aria-label={`Ver ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={200}
                height={200}
                className="h-full w-full object-cover"
                unoptimized={img.url.startsWith("https://via.placeholder")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
