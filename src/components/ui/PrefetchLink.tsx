import React, { useEffect, useState, useRef } from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';

interface PrefetchLinkProps extends Omit<LinkProps, 'onMouseEnter' | 'onFocus'> {
  /**
   * Prefetch method: 
   * - 'hover': prefetch when user hovers over the link (default)
   * - 'visible': prefetch when link becomes visible in viewport
   * - 'instant': prefetch immediately on mount
   */
  prefetchMethod?: 'hover' | 'visible' | 'instant';
  
  /** 
   * Optional delay before starting prefetch (milliseconds)
   * Useful to avoid prefetching routes that the user just passes over
   */
  prefetchDelay?: number;
  
  /** 
   * Whether to prefetch resources or not 
   * Set to false to disable prefetching
   */
  prefetch?: boolean;
  
  /** 
   * Whether to prerender component
   * This helps with faster page transitions by pre-rendering the next page
   */
  prerender?: boolean;
  
  /**
   * Callback when prefetching starts
   */
  onPrefetchStart?: () => void;
  
  /**
   * Callback when prefetching completes
   */
  onPrefetchComplete?: () => void;
}

/**
 * Enhanced Link component that prefetches the linked route
 * Improves perceived performance for page transitions
 */
export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  to,
  children,
  prefetchMethod = 'hover',
  prefetchDelay = 100,
  prefetch = true,
  prerender = false,
  onPrefetchStart,
  onPrefetchComplete,
  ...props
}) => {
  const [isPrefetched, setIsPrefetched] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const timerRef = useRef<number | null>(null);

  // Function to prefetch the route
  const prefetchRoute = async () => {
    if (!prefetch || isPrefetched || isVisited) return;
    
    // Don't prefetch current route
    if (to === location.pathname) return;
    
    if (onPrefetchStart) onPrefetchStart();
    
    try {
      setIsPrefetched(true);
      
      // For string routes, we can dynamically import the component
      // This assumes you're using React Router with dynamic imports
      if (typeof to === 'string') {
        // Clean path for dynamic import (remove query params, etc.)
        const cleanPath = to.split('?')[0].split('#')[0];
        
        // Skip prefetching for external links
        if (cleanPath.startsWith('http')) return;
        
        // Get route components that match this path - requires a router config
        // This is just a placeholder - implement your actual logic
        try {
          // Example: prefetch route component
          // Replace this with your actual code structure
          const routePath = cleanPath === '/' ? '/Home' : cleanPath;
          const path = `./pages${routePath.replace(/\/+$/, '')}.tsx`;
          
          // Dynamic import route component
          // Note: this needs to match your actual file structure
          // This is just a placeholder and will likely need modification
          if (process.env.NODE_ENV === 'development') {
            // In development, we don't actually try to import
            // because paths may be different
            console.log(`[Prefetch] Would prefetch: ${path}`);
          } else {
            // In production, we would try to dynamically import
            // import(`${path}`).catch(error => {
            //   console.debug('[Prefetch] Route prefetch error:', error);
            // });
          }
        } catch (error) {
          // Silent fail for prefetching - should not interrupt UX
          console.debug('[Prefetch] Error prefetching route:', error);
        }
      }

      if (onPrefetchComplete) onPrefetchComplete();
    } catch (error) {
      console.debug('[Prefetch] Prefetch error:', error);
    }
  };

  // Set up intersection observer for 'visible' prefetch method
  useEffect(() => {
    if (!prefetch || isPrefetched || prefetchMethod !== 'visible' || !linkRef.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Clear any existing timer
          if (timerRef.current) window.clearTimeout(timerRef.current);
          
          // Set a new timer
          timerRef.current = window.setTimeout(() => {
            prefetchRoute();
            observer.disconnect();
          }, prefetchDelay);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(linkRef.current);
    
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      observer.disconnect();
    };
  }, [prefetch, isPrefetched, prefetchMethod, prefetchDelay]);
  
  // Instant prefetching when component mounts
  useEffect(() => {
    if (prefetchMethod === 'instant' && prefetch && !isPrefetched) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(prefetchRoute, prefetchDelay);
    }
    
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [prefetchMethod, prefetch, isPrefetched]);

  // Handle hover prefetching
  const handleMouseEnter = () => {
    if (prefetchMethod === 'hover' && prefetch && !isPrefetched) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(prefetchRoute, prefetchDelay);
    }
  };
  
  // Cancel prefetch if the user moves away quickly
  const handleMouseLeave = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Mark as visited on click
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsVisited(true);
    if (props.onClick) props.onClick(e);
  };

  return (
    <Link
      ref={linkRef}
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default PrefetchLink; 