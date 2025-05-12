/**
 * Performance monitoring utility for GudCity Loyalty
 * Provides functions for tracking and improving application performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  timestamp: number;
  userAgent: string;
}

// Only collect metrics in production to avoid development performance issues
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Collects Web Vitals metrics when available
 */
export const collectWebVitals = (): void => {
  if (!isProduction || typeof window === 'undefined') return;

  try {
    import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getLCP(sendToAnalytics);
      getFCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  } catch (error) {
    console.error('Failed to load web-vitals', error);
  }
};

/**
 * Send metrics to analytics
 * This is a placeholder - implement your own analytics sending logic
 */
const sendToAnalytics = (metric: any): void => {
  // Example implementation - replace with your analytics provider
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'web-vitals',
      eventCategory: 'Web Vitals',
      eventAction: metric.name,
      eventValue: Math.round(metric.value),
      eventLabel: metric.id,
      nonInteraction: true,
    });
  }
  
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}: ${Math.round(metric.value)}`);
  }
};

/**
 * Measures component rendering time
 * @param componentName Name of the component to measure
 * @param callback Function to execute and measure
 * @returns Result of the callback function
 */
export function measureRenderTime<T>(componentName: string, callback: () => T): T {
  if (!isProduction) return callback();
  
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  
  // Log render time if it's above threshold (20ms)
  const renderTime = endTime - startTime;
  if (renderTime > 20) {
    console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Start monitoring a named performance marker
 * @param markerName Name for the performance marker
 */
export const startPerformanceMarker = (markerName: string): void => {
  if (!isProduction || typeof performance === 'undefined') return;
  performance.mark(`${markerName}-start`);
};

/**
 * End monitoring a named performance marker and record the measurement
 * @param markerName Name of the performance marker to end
 * @param logToConsole Whether to log the result to console
 */
export const endPerformanceMarker = (markerName: string, logToConsole = false): number | null => {
  if (!isProduction || typeof performance === 'undefined') return null;
  
  try {
    performance.mark(`${markerName}-end`);
    performance.measure(markerName, `${markerName}-start`, `${markerName}-end`);
    
    const entries = performance.getEntriesByName(markerName);
    const duration = entries.length > 0 ? entries[0].duration : 0;
    
    if (logToConsole) {
      console.log(`[Performance] ${markerName}: ${duration.toFixed(2)}ms`);
    }
    
    // Clean up marks and measures
    performance.clearMarks(`${markerName}-start`);
    performance.clearMarks(`${markerName}-end`);
    performance.clearMeasures(markerName);
    
    return duration;
  } catch (error) {
    console.error(`Error measuring performance for ${markerName}:`, error);
    return null;
  }
};

/**
 * Generate a performance report with key metrics
 */
export const generatePerformanceReport = (): PerformanceReport | null => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return null;
  
  const metrics: PerformanceMetric[] = [];
  
  try {
    // Navigation timing metrics
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      // Time to first byte
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      metrics.push({
        name: 'TTFB',
        value: ttfb,
        rating: ttfb < 100 ? 'good' : ttfb < 300 ? 'needs-improvement' : 'poor'
      });
      
      // DOM Content Loaded
      const dcl = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
      metrics.push({
        name: 'DCL',
        value: dcl,
        rating: dcl < 1800 ? 'good' : dcl < 3000 ? 'needs-improvement' : 'poor'
      });
      
      // Load time
      const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      metrics.push({
        name: 'Load',
        value: loadTime,
        rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor'
      });
    }
    
    return {
      metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };
  } catch (error) {
    console.error('Error generating performance report:', error);
    return null;
  }
};

export default {
  collectWebVitals,
  measureRenderTime,
  startPerformanceMarker,
  endPerformanceMarker,
  generatePerformanceReport
}; 