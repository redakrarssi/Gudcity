import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  initialScroll?: number;
}

interface VirtualListResult<T> {
  virtualItems: Array<{ item: T; index: number; offsetTop: number }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: React.CSSProperties;
    onScroll: React.UIEventHandler<HTMLDivElement>;
  };
}

/**
 * A hook for rendering virtualized lists to improve performance with large datasets
 * Only renders items that are visible in the viewport plus a small buffer (overscan)
 * 
 * @param items - The full array of items
 * @param options - Configuration options for the virtual list
 * @returns Object containing virtual items to render and container props
 */
export function useVirtualList<T>(
  items: T[],
  { itemHeight, overscan = 5, initialScroll = 0 }: VirtualListOptions
): VirtualListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(initialScroll);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update container height when component mounts or is resized
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.offsetHeight);
    };

    // Set initial height
    updateHeight();
    
    // Add resize observer to update height when container size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    // Apply initial scroll position if specified
    if (initialScroll > 0) {
      container.scrollTop = initialScroll;
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [initialScroll]);

  // Calculate which items should be visible based on scroll position
  const { virtualItems, startIndex, endIndex, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    
    // Calculate visible range with overscan
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1, 
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    // Create array of virtual items within the visible range
    const virtualItems = items
      .slice(startIndex, endIndex + 1)
      .map((item, index) => ({
        item,
        index: startIndex + index,
        offsetTop: (startIndex + index) * itemHeight
      }));
      
    return { virtualItems, startIndex, endIndex, totalHeight };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  // Handle scrolling to keep track of scroll position
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // Provide method to scroll to a specific item by index
  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  };

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    containerProps: {
      ref: containerRef,
      style: { height: '100%', overflow: 'auto' },
      onScroll: handleScroll
    }
  };
}

export default useVirtualList; 