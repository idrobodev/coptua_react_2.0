import React, { useState, useEffect, createContext, useContext } from 'react';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual Notification Component
const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getNotificationStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    const visibilityStyles = isVisible && !isRemoving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[notification.type]} ${visibilityStyles}`;
  };

  const getIconStyles = () => {
    const icons = {
      success: "fas fa-check-circle text-green-500",
      error: "fas fa-exclamation-circle text-red-500",
      warning: "fas fa-exclamation-triangle text-yellow-500",
      info: "fas fa-info-circle text-blue-500"
    };
    return icons[notification.type];
  };

  return (
    <div className={`${getNotificationStyles()} max-w-sm w-full bg-white shadow-lg rounded-xl border p-4 mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`${getIconStyles()} text-xl`}></i>
        </div>
        <div className="ml-3 w-0 flex-1">
          {notification.title && (
            <p className="text-sm font-Lato font-semibold">
              {notification.title}
            </p>
          )}
          <p className="text-sm font-Poppins mt-1">
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Container
const NotificationContainer = () => {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-4">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => {}} // Handled by provider
        />
      ))}
    </div>
  );
};

// Hook for easy notification usage
export const useNotify = () => {
  const { addNotification } = useNotifications();

  return {
    success: (message, title = 'Éxito') => addNotification({ type: 'success', title, message }),
    error: (message, title = 'Error') => addNotification({ type: 'error', title, message }),
    warning: (message, title = 'Advertencia') => addNotification({ type: 'warning', title, message }),
    info: (message, title = 'Información') => addNotification({ type: 'info', title, message }),
    custom: (notification) => addNotification(notification)
  };
};
