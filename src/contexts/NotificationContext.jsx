import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Notification from '../components/Notification';

// Create notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const showNotification = (type, message, duration = 3000) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    
    // Automatically remove the notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Shorthand functions for specific types
  const showSuccess = (message, duration) => showNotification('success', message, duration);
  const showError = (message, duration) => showNotification('error', message, duration);
  const showWarning = (message, duration) => showNotification('warning', message, duration);
  const showInfo = (message, duration) => showNotification('info', message, duration);

  // Value to be provided to consumers
  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationContext; 