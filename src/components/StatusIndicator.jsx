import PropTypes from 'prop-types';

/**
 * A reusable component that shows success/error status with appropriate colors
 */
const StatusIndicator = ({ 
  status, // 'success', 'error', 'pending', 'idle'
  message,
  className = '',
  showIcon = true
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'pending':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'idle':
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'idle':
      default:
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center p-3 my-2 border-l-4 rounded ${getStatusStyles()} ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
      )}
      <div>{message}</div>
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(['success', 'error', 'pending', 'idle']),
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
  showIcon: PropTypes.bool
};

export default StatusIndicator; 