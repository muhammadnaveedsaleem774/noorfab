"use client";

import Image, { ImageProps } from "next/image";

const DEFAULT_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

export interface ResponsiveImageProps extends Omit<ImageProps, "sizes"> {
  /** Responsive sizes string for next/image */
  sizes?: string;
  /** Load with priority (above fold) */
  priority?: boolean;
}

/**
 * Responsive image wrapper for next/image.
 * - Mobile: full width, smaller resolutions
 * - Tablet: 50vw, medium resolutions
 * - Desktop: 33vw, high resolutions
 * Use WebP with JPEG fallback via next/image config.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = DEFAULT_SIZES,
  priority = false,
  className,
  ...props
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={className}
      {...props}
    />
  );
}
