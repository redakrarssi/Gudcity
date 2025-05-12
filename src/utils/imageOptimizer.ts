/**
 * Image optimization utility for GudCity Loyalty
 * Provides functions for image loading optimization, lazy loading,
 * and responsive image handling
 */

interface ImageDimensions {
  width: number;
  height: number;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Get optimal image dimensions based on the device viewport
 * @param originalDimensions The original image dimensions
 * @returns Optimized dimensions for the current viewport
 */
export const getOptimalDimensions = (originalDimensions: ImageDimensions): ImageDimensions => {
  // If window is not available (SSR), return original dimensions
  if (typeof window === 'undefined') return originalDimensions;
  
  const viewportWidth = window.innerWidth;
  const { width, height } = originalDimensions;
  const aspectRatio = width / height;
  
  // Calculate optimal width based on viewport
  let optimalWidth = width;
  if (viewportWidth < 640) {
    // Mobile viewport
    optimalWidth = Math.min(viewportWidth * 0.9, width);
  } else if (viewportWidth < 1024) {
    // Tablet viewport
    optimalWidth = Math.min(viewportWidth * 0.7, width);
  } else {
    // Desktop viewport
    optimalWidth = Math.min(viewportWidth * 0.5, width);
  }
  
  // Maintain aspect ratio
  const optimalHeight = Math.round(optimalWidth / aspectRatio);
  
  return {
    width: Math.round(optimalWidth),
    height: optimalHeight
  };
};

/**
 * Formats src attribute for responsive images
 * @param src Original image source
 * @param width Image width
 * @param quality Image quality (1-100)
 * @returns Formatted image source with quality and size parameters
 */
export const getSrcSet = (src: string, width: number, quality = 75): string => {
  if (!src.startsWith('http') && !src.startsWith('/')) {
    return src;
  }
  
  // Generate srcset for different screen sizes
  const sizes = [0.25, 0.5, 0.75, 1, 1.5, 2].map(scale => {
    const scaledWidth = Math.round(width * scale);
    // For demonstration, we're just appending width parameters
    // In a real app, you might use a CDN that supports dynamic resizing
    return `${src}?w=${scaledWidth}&q=${quality} ${scaledWidth}w`;
  });
  
  return sizes.join(', ');
};

/**
 * Creates props for an optimized image element
 * @param props Image properties
 * @returns Props including loading strategy and srcset
 */
export const getOptimizedImageProps = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = '100vw',
  loading
}: OptimizedImageProps): React.ImgHTMLAttributes<HTMLImageElement> => {
  const loadingStrategy = priority ? 'eager' : loading || 'lazy';
  
  let imgSizes = sizes;
  if (!sizes || sizes === '100vw') {
    imgSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw';
  }
  
  const props: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    loading: loadingStrategy,
    decoding: 'async',
    className
  };
  
  if (width && height) {
    props.width = width;
    props.height = height;
    props.srcSet = getSrcSet(src, width, quality);
    props.sizes = imgSizes;
  }
  
  return props;
};

/**
 * Prefetches an image for faster loading
 * @param src Image source to prefetch
 */
export const prefetchImage = (src: string): void => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

export default {
  getOptimalDimensions,
  getSrcSet,
  getOptimizedImageProps,
  prefetchImage
}; 