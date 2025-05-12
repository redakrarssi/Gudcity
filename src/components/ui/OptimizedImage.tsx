import React, { useState, useEffect } from 'react';
import { getOptimizedImageProps } from '../../utils/imageOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholderColor?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * OptimizedImage component with lazy loading, placeholder, and responsive capabilities
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  placeholderColor = '#f3f4f6', // Tailwind gray-100
  loading,
  onLoad,
  onError,
  style = {},
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Get optimized image props
  const imgProps = getOptimizedImageProps({
    src,
    alt,
    width,
    height,
    className,
    priority,
    quality,
    sizes,
    loading
  });

  // Create combined styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: !isLoaded && !error ? placeholderColor : undefined,
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0.5
  };

  // If width and height are provided, add aspect ratio
  if (width && height) {
    combinedStyle.aspectRatio = `${width} / ${height}`;
  }

  return (
    <img
      {...imgProps}
      {...rest}
      style={combinedStyle}
      onLoad={handleLoad}
      onError={handleError}
      data-testid="optimized-image"
    />
  );
};

export default OptimizedImage; 