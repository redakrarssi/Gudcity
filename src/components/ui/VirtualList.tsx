import React, { ReactNode, memo } from 'react';
import useVirtualList from '../../hooks/useVirtualList';

interface VirtualListProps<T> {
  items: T[];
  height: string | number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  itemKey: (item: T, index: number) => string | number;
  overscan?: number;
  className?: string;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  initialScrollIndex?: number;
}

/**
 * VirtualList component for efficiently rendering large lists
 * Only renders items that are currently visible in the viewport
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  itemKey,
  overscan = 5,
  className = '',
  onScroll,
  initialScrollIndex = 0
}: VirtualListProps<T>) {
  // Calculate initial scroll position based on initialScrollIndex
  const initialScroll = initialScrollIndex * itemHeight;

  // Use our custom hook for virtualization
  const {
    virtualItems,
    totalHeight,
    containerProps,
    scrollToIndex
  } = useVirtualList(items, {
    itemHeight,
    overscan,
    initialScroll
  });

  // Handle scrolling - combine our internal handler with any external one
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    containerProps.onScroll(e);
    if (onScroll) {
      onScroll(e);
    }
  };

  return (
    <div
      {...containerProps}
      onScroll={handleScroll}
      className={className}
      style={{
        ...containerProps.style,
        height,
        position: 'relative',
        willChange: 'transform'
      }}
    >
      {/* Spacer div to create the total scrollable height */}
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {virtualItems.map(({ item, index, offsetTop }) => (
          <div
            key={itemKey(item, index)}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              width: '100%',
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
export default memo(VirtualList) as typeof VirtualList; 