/**
 * Utilities for optimizing component rendering performance
 */

import { useCallback, useRef, useEffect, MutableRefObject } from 'react';

/**
 * Creates a stable callback function that doesn't change on each render
 * but still has access to current props/state
 * 
 * @param callback The function to stabilize
 * @returns A stable callback function
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  // Use ref to store the callback
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Return stable function that delegates to current callback
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Similar to useMemo, but with deep comparison of dependencies
 * to prevent unnecessary recalculations
 * 
 * @param factory Function that returns the memoized value
 * @param deps Dependencies array
 * @returns The memoized value
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>({
    deps: [],
    value: undefined as unknown as T
  });
  
  // Check if deps have changed using deep comparison
  const depsChanged = !areArraysEqual(deps, ref.current.deps);
  
  if (depsChanged || ref.current.value === undefined) {
    ref.current.deps = deps;
    ref.current.value = factory();
  }
  
  return ref.current.value;
}

/**
 * Creates a ref that persists between renders but is updated when deps change
 * Useful for tracking previous values or creating stable references
 * 
 * @param value The value to track
 * @param deps Dependencies that should trigger an update
 * @returns MutableRefObject to the tracked value
 */
export function useDynamicRef<T>(value: T, deps: any[]): MutableRefObject<T> {
  const ref = useRef<T>(value);
  
  useEffect(() => {
    ref.current = value;
  }, deps); // Only update when deps change
  
  return ref;
}

/**
 * Utility for skipping unnecessary renders
 * Keeps track of the previous props and allows comparing them
 * 
 * @param props Current props to check
 * @param propsToCompare Array of prop names to compare
 * @returns Boolean indicating if renders should be skipped
 */
export function useShouldComponentUpdate<T extends Record<string, any>>(
  props: T,
  propsToCompare: (keyof T)[]
): boolean {
  const prevPropsRef = useRef<Partial<T>>({});
  
  // Check if specified props have changed
  const shouldUpdate = propsToCompare.some(
    (propName) => prevPropsRef.current[propName] !== props[propName]
  );
  
  // Update prev props ref for next render
  useEffect(() => {
    const nextPrevProps: Partial<T> = {};
    propsToCompare.forEach((propName) => {
      nextPrevProps[propName] = props[propName];
    });
    prevPropsRef.current = nextPrevProps;
  });
  
  return shouldUpdate;
}

/**
 * Deep array comparison utility
 * @param arr1 First array
 * @param arr2 Second array
 * @returns Boolean indicating if arrays are equal
 */
function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i];
    const b = arr2[i];
    
    // Handle objects and arrays recursively
    if (a !== b) {
      if (
        a && 
        b && 
        typeof a === 'object' && 
        typeof b === 'object'
      ) {
        if (Array.isArray(a) && Array.isArray(b)) {
          if (!areArraysEqual(a, b)) return false;
        } else {
          // Compare object keys and values
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          
          if (keysA.length !== keysB.length) return false;
          
          for (const key of keysA) {
            if (!b.hasOwnProperty(key) || !areValuesEqual(a[key], b[key])) {
              return false;
            }
          }
        }
      } else {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Deep value comparison utility
 * @param a First value
 * @param b Second value
 * @returns Boolean indicating if values are equal
 */
function areValuesEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (
    a && 
    b && 
    typeof a === 'object' && 
    typeof b === 'object'
  ) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return areArraysEqual(a, b);
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!b.hasOwnProperty(key) || !areValuesEqual(a[key], b[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  return false;
}

export default {
  useStableCallback,
  useDeepMemo,
  useDynamicRef,
  useShouldComponentUpdate
}; 