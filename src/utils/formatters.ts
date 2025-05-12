/**
 * Utility functions for formatting values consistently across the application
 */

/**
 * Format a number as currency
 * @param value The numeric value to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date string or Date object to a readable format
 * @param dateValue Date string or Date object
 * @param format Format style (default: 'medium')
 * @returns Formatted date string
 */
export const formatDate = (
  dateValue: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };
  
  if (format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format a number with commas for thousands separators
 * @param value The numeric value to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}; 